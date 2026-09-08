const { Loan } = require('../models')

const GetAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('userId')
    res.status(200).send(loans)
  }
  catch (error) {
    throw error
  }
}

const GetLoanById = async (req, res) => {
  try {
    const loans = await Loan.findById(req.params.id)
      .populate("userId");

    res.status(200).send(loans);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};



const CreateLoan = async (req, res) => {
  try {
    const loan = await Loan.create({
      ...req.body,
      loanOwner: res.locals.payload.id
    })

    res.status(201).send(loan)

  } catch (error) {
    console.log("CREATE LOAN ERROR:", error)

    res.status(500).send({
      msg: "Error creating loan",
      error: error.message
    })
  }
}



// const CreateLoan = async (req, res) => {
//   try {
//     const loan = await Loan.create({
//       ...req.body,
//       loanOwner: res.locals.payload.id
//     })

//     res.status(201).send(loan)
//   } catch (error) {
//     console.log("CREATE LOAN ERROR:", error)

//     res.status(500).send({
//       msg: "Error creating loan",
//       error: error.message
//     })
//   }
// }

// const UpdateLoan = async (req, res) => {
//   try {
//     const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true })
//     res.status(200).send(loan)
//   } catch (error) {
//     throw error
//   }
// }





const UpdateLoan = async (req, res) => {
  try {

    // ============================================
    // GET CURRENT LOAN
    // ============================================

    const currentLoan = await Loan.findById(req.params.id);

    if (!currentLoan) {
      return res.status(404).send({
        msg: "Loan not found"
      });
    }


    // ============================================
    // ONLY CHECK WHEN ACCEPTING A LOAN
    // ============================================

    if (
      req.body.loanStatus === "مقبول" &&
      currentLoan.loanStatus !== "مقبول"
    ) {

      // ==========================================
      // GET SUCCESSFUL VOUCHERS
      // ==========================================

      const { Voucher } = require("../models");

      const vouchers = await Voucher.find({
        paymentStatus: "تمت العملية بنجاح"
      });


      // ==========================================
      // TOTAL MONTHLY SUBSCRIPTIONS
      // ==========================================

      const totalMonthlyPayments = vouchers
        .filter(
          (voucher) =>
            voucher.paymentType === "دفع شهري"
        )
        .reduce(
          (sum, voucher) =>
            sum + Number(voucher.voucherAmount || 0),
          0
        );


      // ==========================================
      // TOTAL LOAN INSTALLMENTS
      // ==========================================

      const totalLoanPayments = vouchers
        .filter(
          (voucher) =>
            voucher.paymentType === "دفع قسط القرض"
        )
        .reduce(
          (sum, voucher) =>
            sum + Number(voucher.voucherAmount || 0),
          0
        );


      // ==========================================
      // GET OTHER ACCEPTED LOANS
      // ==========================================

      const acceptedLoans = await Loan.find({
        loanStatus: "مقبول",
        _id: { $ne: currentLoan._id }
      });


      // ==========================================
      // TOTAL ACCEPTED LOANS
      // ==========================================

      const totalAcceptedLoans = acceptedLoans
        .reduce(
          (sum, loan) =>
            sum + Number(loan.loanAmountNumber || 0),
          0
        );


      // ==========================================
      // AVAILABLE MONEY
      // ==========================================

      const totalAvailable =
        totalMonthlyPayments +
        totalLoanPayments -
        totalAcceptedLoans;


      // ==========================================
      // REQUIRED LOAN AMOUNT
      // ==========================================

      const requiredLoanAmount =
        Number(
          req.body.loanAmountNumber ||
          currentLoan.loanAmountNumber ||
          0
        );


      // ==========================================
      // CHECK LIMIT
      // ==========================================

      if (requiredLoanAmount > totalAvailable) {

        return res.status(400).send({
          msg: "لا يمكن قبول القرض",
          reason: "مبلغ القرض يتجاوز المبلغ المتاح",
          requiredAmount: requiredLoanAmount,
          availableAmount: totalAvailable
        });

      }

    }


    // ============================================
    // UPDATE LOAN
    // ============================================

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).send(loan);

  } catch (error) {

    console.log("UPDATE LOAN ERROR:", error);

    res.status(500).send({
      msg: "Error updating loan",
      error: error.message
    });

  }
};

const DeleteLoan = async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (error) {
    throw error
  }
}



const GetLoanByUserId = async (req, res) => {
  try {
    const loans = await Loan.find({
      userId: req.params.userId
    }).populate("userId");

    res.status(200).send(loans);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  GetAllLoans,
  GetLoanById,
  GetLoanByUserId,
  CreateLoan,
  UpdateLoan,
  DeleteLoan,
}
