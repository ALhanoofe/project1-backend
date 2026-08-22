const { Voucher, Loan } = require('../models')

const GetVouchers = async (req, res) => {
  try {

    const vouchers = await Voucher.find()
      .populate("userId")

    res.status(200).send(vouchers)

  } catch (error) {
    throw error
  }
}

// const GetVoucherByUserId = async (req, res) => {
//   try {
//     const vouchers = await Voucher.find({ userId: req.params.id })
//       .populate("userId");

//     res.status(200).send(vouchers);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message);
//   }
// };

const GetVoucherById = async (req, res) => {
  try {
    const vouchers = await Voucher.findById(req.params.id)
      .populate("userId");

    res.status(200).send(vouchers);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

const CreateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body)
    res.status(201).send(voucher)
  }
  catch (error) {
    throw error
  }
}

// const UpdateVoucher = async (req, res) => {
//   try {
//     const voucher = await Voucher.findByIdAndUpdate(req.params.id, req
//       .body, { new: true })
//     res.status(200).send(voucher)
//   }
//   catch (error) {
//     throw error
//   }

// }



const UpdateVoucher = async (req, res) => {
  try {
    // Get the existing voucher BEFORE updating it
    const oldVoucher = await Voucher.findById(req.params.id)

    if (!oldVoucher) {
      return res.status(404).send({
        message: "Voucher not found"
      })
    }

    const oldStatus = oldVoucher.paymentStatus
    const newStatus = req.body.paymentStatus

    const oldAmount = Number(oldVoucher.voucherAmount) || 0
    const newAmount = Number(req.body.voucherAmount) || 0

    /*
     * Only loan installment payments affect
     * Loan.remainingAmount
     */
    if (
      oldVoucher.paymentType === "دفع قسط القرض" &&
      oldVoucher.loanRelated
    ) {
      const loan = await Loan.findById(oldVoucher.loanRelated)

      if (!loan) {
        return res.status(404).send({
          message: "Related loan not found"
        })
      }

      const wasSuccessful =
        oldStatus === "تمت العملية بنجاح"

      const isSuccessful =
        newStatus === "تمت العملية بنجاح"

      /*
       * 1. Pending/Rejected → Successful
       *
       * Subtract the payment from the remaining loan amount.
       */
      if (!wasSuccessful && isSuccessful) {
        loan.remainingAmount =
          Number(loan.remainingAmount) - newAmount
      }

      /*
       * 2. Successful → Pending/Rejected
       *
       * Return the previous payment amount to the loan.
       */
      else if (wasSuccessful && !isSuccessful) {
        loan.remainingAmount =
          Number(loan.remainingAmount) + oldAmount
      }

      /*
       * 3. Successful → Successful
       *
       * If the amount was changed, only apply the difference.
       *
       * Example:
       * Old payment = 10
       * New payment = 15
       * Difference = 5
       *
       * remainingAmount decreases by only 5.
       */
      else if (wasSuccessful && isSuccessful) {
        const difference = newAmount - oldAmount

        loan.remainingAmount =
          Number(loan.remainingAmount) - difference
      }

      /*
       * Prevent negative remaining amount.
       */
      if (loan.remainingAmount < 0) {
        loan.remainingAmount = 0
      }

      /*
       * Update loan progress status.
       */
      if (loan.remainingAmount === 0) {
        loan.loanProgressStatus = "finished"
      } else if (
        loan.remainingAmount < loan.loanAmountNumber
      ) {
        loan.loanProgressStatus = "ongoing"
      } else {
        loan.loanProgressStatus = "not_started"
      }

      await loan.save()
    }

    /*
     * Now update the voucher.
     */
    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )

    res.status(200).send(voucher)

  } catch (error) {
    console.log("UpdateVoucher error:", error)

    res.status(500).send({
      message: "Error updating voucher",
      error: error.message
    })
  }
}

const DeleteVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id)
    res.status(204).send()
  }
  catch (error) {
    throw error
  }
}

module.exports = {
  GetVouchers,
  GetVoucherById,
  CreateVoucher,
  UpdateVoucher,
  DeleteVoucher
}