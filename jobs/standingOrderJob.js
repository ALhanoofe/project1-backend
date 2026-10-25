const cron = require("node-cron");
const { User, Voucher } = require("../models");


// ======================================================
// GET LAST DAY OF MONTH
// ======================================================

const getLastDayOfMonth = (year, month) => {
  return new Date(
    year,
    month + 1,
    0
  ).getDate();
};


// ======================================================
// RUN STANDING ORDERS
// ======================================================

const runStandingOrders = async () => {

  try {

    const now = new Date();

    const currentYear =
      now.getFullYear();

    const currentMonth =
      now.getMonth();

    const currentDay =
      now.getDate();


    // ==================================================
    // CURRENT MONTH PERIOD
    // Example: 2026-09
    // ==================================================

    const standingOrderPeriod =
      `${currentYear}-${String(
        currentMonth + 1
      ).padStart(2, "0")}`;


    console.log(
      `Checking Standing Orders: ${standingOrderPeriod}`
    );


    // ==================================================
    // FIND USERS WITH STANDING ORDER
    // ==================================================

    const users = await User.find({

      paymentMethod: "Standing Order",

      status: "approved",

      SOpaymentAmount: {
        $gt: 0
      },

      SOpaymentDate: {
        $exists: true,
        $ne: null
      }

    });


    console.log(
      `Found ${users.length} Standing Order users`
    );


    // ==================================================
    // PROCESS EACH USER
    // ==================================================

    for (const user of users) {

      if (!user.SOpaymentDate) {
        continue;
      }


      // ==================================================
      // USER'S REQUESTED DAY
      // ==================================================

      const requestedDay =
        new Date(
          user.SOpaymentDate
        ).getDate();


      // ==================================================
      // LAST DAY OF CURRENT MONTH
      // ==================================================

      const lastDayOfMonth =
        getLastDayOfMonth(
          currentYear,
          currentMonth
        );


      // ==================================================
      // OPTION B
      //
      // If requested day is greater than the
      // last day of this month, use the last day.
      //
      // Example:
      //
      // User selects 31
      //
      // February:
      // requestedDay = 31
      // lastDay = 28
      //
      // actualPaymentDay = 28
      // ==================================================

      const actualPaymentDay =
        Math.min(
          requestedDay,
          lastDayOfMonth
        );


      // ==================================================
      // IS TODAY THE PAYMENT DAY?
      // ==================================================

      if (
        currentDay !== actualPaymentDay
      ) {

        continue;

      }


      // ==================================================
      // CHECK DUPLICATE
      // ==================================================

      const existingVoucher =
        await Voucher.findOne({

          userId: user._id,

          paymentType: "دفع شهري",

          paymentSource: "Standing Order",

          standingOrderPeriod

        });


      if (existingVoucher) {

        console.log(
          `Voucher already exists for ${user.memberName} - ${standingOrderPeriod}`
        );

        continue;

      }


      // ==================================================
      // CREATE VOUCHER
      // ==================================================

      const voucher =
        await Voucher.create({

          userId: user._id,

          senderBenefitNo:
            user.phoneNumber
              ? String(user.phoneNumber)
              : "",

          voucherAmount:
            Number(user.SOpaymentAmount),

          PaymentDate: now,

          paymentType: "دفع شهري",

          paymentStatus:
            "قيد التأكيد",

          paymentSource:
            "Standing Order",

          standingOrderPeriod,

          loanRelated: null,

          alnathreuatRelated: null

        });


      console.log(
        `Standing Order voucher created: ${user.memberName}`,
        voucher._id
      );

    }


    console.log(
      "Standing Order check completed"
    );


  } catch (error) {

    console.error(
      "Standing Order Job Error:",
      error
    );

  }

};


// ======================================================
// RUN EVERY DAY AT 12:05 AM
// BAHRAIN TIME
// ======================================================

cron.schedule(
  "5 0 * * *",
  runStandingOrders,
  {
    timezone: "Asia/Bahrain"
  }
);


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  runStandingOrders
};