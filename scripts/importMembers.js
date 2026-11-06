
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const path = require("path");
const os = require("os");
const fs = require("fs");
const readline = require("readline/promises");

require("dotenv").config();

const { User } = require("../models");
const middleware = require("../models/middleware");
const blockCityMapping = require("./blockCityMapping");

// Terminal input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Report location
const REPORT_FOLDER = path.join(__dirname, "..", "reports");
const REPORT_FILE = path.join(
  REPORT_FOLDER,
  "members-validation-report.xlsx"
);

// Clean Excel values
function cleanText(value) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

// Clean optional fields: convert zero to empty string
function cleanOptionalZero(value) {
  const text = cleanText(value);
  return text === "0" ? "" : text;
}

// Check whether a value represents zero
function isZero(value) {
  return cleanText(value) === "0";
}

// Convert Excel amount into a number
function parseAmount(value) {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return { value: null, valid: true };
  }

  const number = Number(cleaned.replace(/,/g, ""));

  if (!Number.isFinite(number) || number < 0) {
    return { value: null, valid: false };
  }

  return { value: number, valid: true };
}

// Parse common Excel date formats
function parseDate(value) {
  if (value === undefined || value === null || value === "") {
    return { value: null, valid: true };
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? { value: null, valid: false }
      : { value, valid: true };
  }

  const dateText = cleanText(value);

  // Excel serial date
  if (/^\d{5}(\.\d+)?$/.test(dateText)) {
    const excelDate = xlsx.SSF.parse_date_code(Number(dateText));

    if (!excelDate) {
      return { value: null, valid: false };
    }

    return {
      value: new Date(
        Date.UTC(excelDate.y, excelDate.m - 1, excelDate.d)
      ),
      valid: true
    };
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const localDate = dateText.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
  );

  if (localDate) {
    const day = Number(localDate[1]);
    const month = Number(localDate[2]);
    const year = Number(localDate[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return { value: null, valid: false };
    }

    return { value: date, valid: true };
  }

  // YYYY-MM-DD
  const isoDate = dateText.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (isoDate) {
    const year = Number(isoDate[1]);
    const month = Number(isoDate[2]);
    const day = Number(isoDate[3]);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return { value: null, valid: false };
    }

    return { value: date, valid: true };
  }

  // Other recognizable date formats
  const parsed = new Date(dateText);

  if (Number.isNaN(parsed.getTime())) {
    return { value: null, valid: false };
  }

  return { value: parsed, valid: true };
}

// Determine member status
function mapStatus(value) {
  const status = cleanText(value).toLowerCase();

  if (status === "active") return "approved";
  if (status === "stopped") return "withdrawn";

  return null;
}

// Determine inheritance policy
function getInheritancePolicy(sponsorName) {
  const name = cleanText(sponsorName);

  if (
    !name ||
    name === "صدقة جارية" ||
    isZero(name)
  ) {
    return "option1";
  }

  return "option2";
}

async function main() {
  let connected = false;

  try {
    // =========================================
    // 1. Ask for Excel file path
    // =========================================

    console.log("\n========== MEMBER IMPORT ==========");

    const inputPath = await rl.question(
      "\nPlease enter the Excel file path: "
    );

    // Remove surrounding quotes if the path was pasted with quotes
    const cleanedPath = inputPath.trim().replace(/^(['"])(.*)\1$/, "$2");

    if (!cleanedPath) {
      throw new Error("No Excel file path was provided.");
    }

    // Support paths beginning with ~
    const expandedPath = cleanedPath.replace(
      /^~(?=$|[\\/])/,
      os.homedir()
    );

    const EXCEL_FILE_PATH = path.resolve(expandedPath);

    // Check whether the file exists
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      throw new Error(`Excel file not found: ${EXCEL_FILE_PATH}`);
    }

    if (!fs.statSync(EXCEL_FILE_PATH).isFile()) {
      throw new Error(`The provided path is not a file: ${EXCEL_FILE_PATH}`);
    }

    console.log("\nExcel file:", EXCEL_FILE_PATH);

    // =========================================
    // 2. Connect to MongoDB
    // =========================================

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;

    console.log("Connected to MongoDB successfully.");

    // =========================================
    // 3. Read workbook
    // =========================================

    const workbook = xlsx.readFile(EXCEL_FILE_PATH);

    if (workbook.SheetNames.length < 2) {
      throw new Error(
        "The Excel workbook does not contain a second sheet."
      );
    }

    // Select second sheet
    const sheetName = workbook.SheetNames[1];
    const worksheet = workbook.Sheets[sheetName];

    // Read worksheet as rows, preserving Excel row positions
    const matrix = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      raw: false,
      blankrows: true
    });

    if (matrix.length < 2) {
      throw new Error("The second worksheet contains no member records.");
    }

    const headers = matrix[0].map(cleanText);
    const dataRows = matrix.slice(1);

    const records = [];

    // =========================================
    // 4. Process each Excel row
    // =========================================

    for (let index = 0; index < dataRows.length; index++) {
      const values = dataRows[index];

      // Skip completely empty rows
      if (values.every(value => cleanText(value) === "")) {
        continue;
      }

      const excelRow = index + 2;
      const row = {};

      headers.forEach((header, columnIndex) => {
        if (header) {
          row[header] = values[columnIndex] ?? "";
        }
      });

      // Check whether this row contains actual member information
      const memberColumns = [
        "اسم المساهم",
        "EMAIL",
        "MEMBER_CPR",
        "MEMBERSHIP_AMOUNT",
        "JOIN_DATE",
        "حالة المساهم",
        "FLAT_NO",
        "BUILDING_NO",
        "ROAD",
        "BLOCK_NO",
        "HOME_TEL",
        "MOBILE1",
        "MOBILE2",
        "WORK_TEL",
        "FAX_NO",
        "SPONSOR_CPR",
        "SPONSOR_NAME",
        "SPONSOR_RELATION",
        "SPONSOR_HOME_TEL",
        "SPONSOR_MOBILE1",
        "SPONSOR_WORK_TEL",
        "SPONSOR_WORK_FAX"
      ];

      const hasMemberInformation = memberColumns.some(
        column => cleanText(row[column]) !== ""
      );

      // Ignore calculation rows and completely empty member rows
      if (!hasMemberInformation) {
        continue;
      }

      const errors = [];
      const warnings = [];

      // Map member details
      const memberName = cleanText(row["اسم المساهم"]);
      const memberEmail = cleanOptionalZero(row.EMAIL);

      const CPR = cleanText(row.MEMBER_CPR);

      const phoneNumber = cleanOptionalZero(row.MOBILE1);
      const extraNumber = cleanOptionalZero(row.MOBILE2);
      const homeNumber = cleanOptionalZero(row.HOME_TEL);
      const officeNumber = cleanOptionalZero(row.WORK_TEL);
      const faxNumber = cleanOptionalZero(row.FAX_NO);

      const buildingNo = cleanOptionalZero(row.BUILDING_NO);
      const blockNo = cleanOptionalZero(row.BLOCK_NO);
      const rodeNo = cleanOptionalZero(row.ROAD);
      const flatNo = cleanOptionalZero(row.FLAT_NO);

      // Validate member name
      if (!memberName) {
        errors.push("اسم المساهم مفقود");
      }

      // Validate CPR
      if (!CPR) {
        errors.push("CPR مفقود");
      } else if (!/^\d{9}$/.test(CPR)) {
        errors.push("CPR يجب أن يتكون من 9 أرقام بالضبط");
      }

      // Validate membership status
      const status = mapStatus(row["حالة المساهم"]);

      if (!status) {
        errors.push(
          `حالة المساهم غير معروفة: ${
            cleanText(row["حالة المساهم"]) || "فارغة"
          }`
        );
      }

      // Validate subscription amount
      const amountResult = parseAmount(row.MEMBERSHIP_AMOUNT);

      if (!amountResult.valid) {
        errors.push("MEMBERSHIP_AMOUNT ليس مبلغاً رقمياً صالحاً");
      }

      // Validate join date
      const dateResult = parseDate(row.JOIN_DATE);

      if (!dateResult.valid) {
        errors.push("JOIN_DATE غير صالح أو غير مفهوم");
      }

      // City mapping
      const city = blockCityMapping[blockNo] || "";

      if (!blockNo) {
        warnings.push("رقم البلوك مفقود");
      } else if (!city) {
        warnings.push(`رقم البلوك ${blockNo} غير موجود في خريطة المدن`);
      }

      // Optional information warnings
      if (!memberEmail) {
        warnings.push("البريد الإلكتروني غير موجود");
      }

      if (!phoneNumber) {
        warnings.push("رقم الهاتف المحمول غير موجود");
      }

      if (!cleanText(row.MEMBERSHIP_AMOUNT)) {
        warnings.push("مبلغ الاشتراك مفقود");
      }

      if (!cleanText(row.JOIN_DATE)) {
        warnings.push("تاريخ الانضمام مفقود");
      }

      // Sponsor information
      const sponsorName = cleanText(row.SPONSOR_NAME);

      const inheritancePolicy = getInheritancePolicy(sponsorName);

      const hasPersonSponsor = inheritancePolicy === "option2";

      const member = {
        memberName,
        memberEmail,
        CPR,

        phoneNumber,
        extraNumber,
        homeNumber,
        officeNumber,
        faxNumber,

        buildingNo,
        blockNo,
        rodeNo,
        flatNo,
        city,

        subscriptionAmount: amountResult.value,
        subscriptionDate: dateResult.value,

        status,
        role: "user",
        paymentMethod: "benefit",
        formCompleted: true,

        inheritancePolicy,

        projectPersonName: hasPersonSponsor ? sponsorName : "",

        projectPersonCpr: hasPersonSponsor
          ? cleanOptionalZero(row.SPONSOR_CPR)
          : "",

        projectPersonRelation: hasPersonSponsor
          ? cleanOptionalZero(row.SPONSOR_RELATION)
          : "",

        projectHomePhone: hasPersonSponsor
          ? cleanOptionalZero(row.SPONSOR_HOME_TEL)
          : "",

        projectPersonPhone: hasPersonSponsor
          ? cleanOptionalZero(row.SPONSOR_MOBILE1)
          : "",

        projectWorkPhone: hasPersonSponsor
          ? cleanOptionalZero(row.SPONSOR_WORK_TEL)
          : "",

        projectWorkFax: hasPersonSponsor
          ? cleanOptionalZero(row.SPONSOR_WORK_FAX)
          : ""
      };

      records.push({
        excelRow,
        member,
        errors,
        warnings
      });
    }

    console.log(`\nWorksheet: ${sheetName}`);
    console.log("Records found:", records.length);

    // =========================================
    // 5. Find duplicate CPR numbers inside Excel
    // =========================================

    const cprCounts = new Map();

    for (const record of records) {
      const cpr = record.member.CPR;

      if (/^\d{9}$/.test(cpr)) {
        cprCounts.set(cpr, (cprCounts.get(cpr) || 0) + 1);
      }
    }

    for (const record of records) {
      const cpr = record.member.CPR;

      if (cprCounts.get(cpr) > 1) {
        record.errors.push("CPR مكرر داخل ملف Excel");
      }
    }

    // =========================================
    // 6. Check existing CPR numbers in MongoDB
    // =========================================

    const validCPRs = [
      ...new Set(
        records
          .map(record => record.member.CPR)
          .filter(cpr => /^\d{9}$/.test(cpr))
      )
    ];

    const existingUsers = await User.find({
      CPR: { $in: validCPRs }
    })
      .select("CPR memberName")
      .lean();

    const existingCPRSet = new Set(
      existingUsers.map(user => cleanText(user.CPR))
    );

    for (const record of records) {
      if (existingCPRSet.has(record.member.CPR)) {
        record.errors.push("CPR موجود مسبقاً في MongoDB");
      }
    }

    // =========================================
    // 7. Prepare Excel report
    // =========================================

    const reportHeaders = [
      "Excel Row",
      "Member Name",
      "Email",
      "CPR",
      "Mobile",
      "Extra Mobile",
      "Home Telephone",
      "Work Telephone",
      "Fax",
      "Building No",
      "Block No",
      "City",
      "Road",
      "Flat No",
      "Subscription Amount",
      "Join Date",
      "Status",
      "Inheritance Policy",
      "Sponsor Name",
      "Sponsor CPR",
      "Sponsor Relation",
      "Sponsor Home Phone",
      "Sponsor Mobile",
      "Sponsor Work Phone",
      "Sponsor Work Fax",
      "Validation Status",
      "Errors",
      "Warnings"
    ];

    function makeReportRow(record) {
      const member = record.member;

      return {
        "Excel Row": record.excelRow,
        "Member Name": member.memberName,
        "Email": member.memberEmail,
        "CPR": member.CPR,
        "Mobile": member.phoneNumber,
        "Extra Mobile": member.extraNumber,
        "Home Telephone": member.homeNumber,
        "Work Telephone": member.officeNumber,
        "Fax": member.faxNumber,
        "Building No": member.buildingNo,
        "Block No": member.blockNo,
        "City": member.city,
        "Road": member.rodeNo,
        "Flat No": member.flatNo,
        "Subscription Amount": member.subscriptionAmount,
        "Join Date": member.subscriptionDate
          ? member.subscriptionDate.toISOString().slice(0, 10)
          : "",
        "Status": member.status,
        "Inheritance Policy": member.inheritancePolicy,
        "Sponsor Name": member.projectPersonName,
        "Sponsor CPR": member.projectPersonCpr,
        "Sponsor Relation": member.projectPersonRelation,
        "Sponsor Home Phone": member.projectHomePhone,
        "Sponsor Mobile": member.projectPersonPhone,
        "Sponsor Work Phone": member.projectWorkPhone,
        "Sponsor Work Fax": member.projectWorkFax,
        "Validation Status": record.errors.length ? "Invalid" : "Valid",
        "Errors": record.errors.join(" | "),
        "Warnings": record.warnings.join(" | ")
      };
    }

    const allRecords = records.map(makeReportRow);

    const invalidRecords = records
      .filter(record => record.errors.length > 0)
      .map(makeReportRow);

    const unknownCities = records
      .filter(record =>
        record.member.blockNo &&
        !record.member.city
      )
      .map(record => {
        const reportRow = makeReportRow(record);

        reportRow["City Issue"] =
          `Unknown block number: ${record.member.blockNo}`;

        return reportRow;
      });

    // Create reports folder if it does not exist
    fs.mkdirSync(REPORT_FOLDER, { recursive: true });

    const reportWorkbook = xlsx.utils.book_new();

    const allSheet = xlsx.utils.json_to_sheet(allRecords, {
      header: reportHeaders
    });

    const invalidSheet = xlsx.utils.json_to_sheet(invalidRecords, {
      header: reportHeaders
    });

    const unknownCityHeaders = [
      ...reportHeaders,
      "City Issue"
    ];

    const unknownCitySheet = xlsx.utils.json_to_sheet(unknownCities, {
      header: unknownCityHeaders
    });

    xlsx.utils.book_append_sheet(
      reportWorkbook,
      allSheet,
      "All Records"
    );

    xlsx.utils.book_append_sheet(
      reportWorkbook,
      invalidSheet,
      "Invalid Records"
    );

    xlsx.utils.book_append_sheet(
      reportWorkbook,
      unknownCitySheet,
      "Unknown Cities"
    );

    xlsx.writeFile(reportWorkbook, REPORT_FILE);

    // =========================================
    // 8. Validation summary
    // =========================================

    const validCount = records.filter(
      record => record.errors.length === 0
    ).length;

    console.log("\n========== VALIDATION SUMMARY ==========");
    console.log("Total records:", records.length);
    console.log("Valid records:", validCount);
    console.log("Invalid records:", invalidRecords.length);
    console.log("Unknown city records:", unknownCities.length);
    console.log("Existing CPR matches:", existingUsers.length);

    console.log("\nReport created successfully:");
    console.log(REPORT_FILE);

    // =========================================
    // 9. Stop if validation errors exist
    // =========================================

    if (records.length === 0) {
      throw new Error("No member records were found.");
    }

    if (invalidRecords.length > 0) {
      console.log(
        "\nInsertion cancelled because validation errors were found."
      );
      console.log("Please review the Invalid Records sheet.");
      return;
    }

    // =========================================
    // 10. Ask for insertion confirmation
    // =========================================

    console.log("\nAll records passed validation.");

    const insertAnswer = await rl.question(
      "\nDo you want to insert these users into MongoDB? (yes/no): "
    );

    if (insertAnswer.trim().toLowerCase() !== "yes") {
      console.log("\nImport cancelled by user.");
      console.log("No database records were inserted or modified.");
      return;
    }

    // =========================================
    // 11. Recheck CPR numbers before insertion
    // =========================================

    console.log("\n========== DATABASE INSERTION ==========");

    const cprsToInsert = records.map(
      record => record.member.CPR
    );

    const latestExistingUsers = await User.find({
      CPR: { $in: cprsToInsert }
    })
      .select("CPR")
      .lean();

    if (latestExistingUsers.length > 0) {
      throw new Error(
        `Insertion cancelled: ${latestExistingUsers.length} CPR numbers already exist in MongoDB.`
      );
    }

    // =========================================
    // 12. Hash temporary password
    // =========================================

    const hashedPassword = await middleware.hashPassword("123");

    // Prepare User documents
    const usersToInsert = records.map(record => ({
      ...record.member,
      password: hashedPassword
    }));

    // =========================================
    // 13. Insert users only
    // =========================================

    const insertedUsers = await User.insertMany(
      usersToInsert,
      { ordered: true }
    );

    console.log("\nUsers inserted successfully:", insertedUsers.length);
    console.log("MonthlyPayment records created: 0");
    console.log("Existing users were not modified.");

  } catch (error) {
    console.error("\nImport failed:", error.message);
    process.exitCode = 1;

  } finally {
    if (connected) {
      await mongoose.disconnect();
      console.log("\nMongoDB connection closed.");
    }

    rl.close();
  }
}

main();
