const {
  Alnathreuat,
  User,
  Voucher
} = require("../models");

// =========================================
// GET ALL
// =========================================

const GetAllAlnathreuats = async (req, res) => {
  try {
    const alnathreuats =
      await Alnathreuat.find()
        .populate("userId")
        .populate("voucherId")
        .sort({ createdAt: -1 });

    res.status(200).send(alnathreuats);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: error.message
    });
  }
};

// =========================================
// GET BY ID
// =========================================

const GetAlnathreuatById = async (req, res) => {
  try {
    const alnathreuat =
      await Alnathreuat.findById(req.params.id)
        .populate("userId")
        .populate("voucherId");

    if (!alnathreuat) {
      return res.status(404).send({
        message: "النثريات غير موجودة"
      });
    }

    res.status(200).send(alnathreuat);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: error.message
    });
  }
};

// =========================================
// GET PENDING REQUESTS FOR USER
// =========================================

const GetPendingAlnathreuatsByUserId = async (
  req,
  res
) => {
  try {
    const requests =
      await Alnathreuat.find({
        userId: req.params.id,
        recordType: "request",
        status: "قيد الانتظار"
      })
        .populate("userId")
        .sort({ createdAt: -1 });

    res.status(200).send(requests);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: error.message
    });
  }
};

// =========================================
// CREATE
// =========================================

const CreateAlnathreuat = async (req, res) => {
  try {
    const alnathreuat =
      await Alnathreuat.create(req.body);

    res.status(201).send(alnathreuat);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: error.message
    });
  }
};

// =========================================
// ACCEPT REQUEST
// =========================================

const AcceptAlnathreuat = async (req, res) => {
  try {
    const { id } = req.params;

    const request =
      await Alnathreuat.findById(id);

    if (!request) {
      return res.status(404).send({
        message: "طلب النثريات غير موجود"
      });
    }

    if (request.recordType !== "request") {
      return res.status(400).send({
        message: "هذا السجل ليس طلب نثريات"
      });
    }

    if (request.status !== "قيد الانتظار") {
      return res.status(400).send({
        message: "تمت معالجة هذا الطلب مسبقاً"
      });
    }

    const user =
      await User.findById(request.userId);

    if (!user) {
      return res.status(404).send({
        message: "المستخدم غير موجود"
      });
    }

    // =========================================
    // CALCULATE USER BALANCE
    // =========================================

    const successfulVouchers =
      await Voucher.find({
        userId: user._id,
        paymentStatus: "تمت العملية بنجاح"
      });

    const totalIncome =
      successfulVouchers
        .filter(
          (voucher) =>
            voucher.paymentType === "دفع شهري" ||
            voucher.paymentType ===
              "دفع قسط القرض"
        )
        .reduce(
          (sum, voucher) =>
            sum +
            Number(
              voucher.voucherAmount || 0
            ),
          0
        );

    const totalNathreuat =
      successfulVouchers
        .filter(
          (voucher) =>
            voucher.paymentType ===
            "النثريات"
        )
        .reduce(
          (sum, voucher) =>
            sum +
            Number(
              voucher.voucherAmount || 0
            ),
          0
        );

    const availableBalance =
      totalIncome - totalNathreuat;

    // =========================================
    // CHECK BALANCE
    // =========================================

    if (
      availableBalance <
      Number(request.Amount)
    ) {
      return res.status(400).send({
        message:
          `الرصيد غير كافي. الرصيد المتاح: ${availableBalance.toFixed(
            2
          )} د.ب`
      });
    }

    // =========================================
    // CREATE VOUCHER
    // =========================================

    const voucher =
      await Voucher.create({
        userId: user._id,

        senderBenefitNo:
          String(user.phoneNumber || ""),

        voucherAmount:
          Number(request.Amount),

        PaymentDate: new Date(),

        paymentType:
          "النثريات",

        paymentStatus:
          "تمت العملية بنجاح",

        alnathreuatRelated:
          request._id
      });

    // =========================================
    // UPDATE REQUEST
    // =========================================

    request.status =
      "تم القبول";

    request.processedAt =
      new Date();

    request.voucherId =
      voucher._id;

    await request.save();

    res.status(200).send({
      message:
        "تم قبول طلب النثريات بنجاح",

      request,

      voucher
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: error.message
    });
  }
};

// =========================================
// REJECT REQUEST
// =========================================

const RejectAlnathreuat = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const request =
      await Alnathreuat.findById(id);

    if (!request) {
      return res.status(404).send({
        message: "طلب النثريات غير موجود"
      });
    }

    if (request.recordType !== "request") {
      return res.status(400).send({
        message: "هذا السجل ليس طلب نثريات"
      });
    }

    if (request.status !== "قيد الانتظار") {
      return res.status(400).send({
        message: "تمت معالجة هذا الطلب مسبقاً"
      });
    }

    request.status =
      "مرفوض";

    request.rejectReason =
      req.body.rejectReason ||
      "تم رفض طلب النثريات";

    request.processedAt =
      new Date();

    await request.save();

    res.status(200).send({
      message:
        "تم رفض طلب النثريات",

      request
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: error.message
    });
  }
};

// =========================================
// UPDATE
// =========================================

const UpdateAlnathreuat = async (
  req,
  res
) => {
  try {
    const alnathreuat =
      await Alnathreuat.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true
        }
      );

    res.status(200).send(alnathreuat);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: error.message
    });
  }
};

// =========================================
// DELETE
// =========================================

const DeleteAlnathreuat = async (
  req,
  res
) => {
  try {
    await Alnathreuat.findByIdAndDelete(
      req.params.id
    );

    res.status(204).send();
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: error.message
    });
  }
};

// =========================================
// EXPORT
// =========================================

module.exports = {
  GetAllAlnathreuats,
  GetAlnathreuatById,
  GetPendingAlnathreuatsByUserId,
  CreateAlnathreuat,
  AcceptAlnathreuat,
  RejectAlnathreuat,
  UpdateAlnathreuat,
  DeleteAlnathreuat
};