const { Schema } = require('mongoose');

const VoucherSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
    senderBenefitNo: {
    type: String,
    required: true
  },
  voucherAmount: {
    type: Number,
    required: true
  },
  PaymentDate: {
    type: Date,
    default: Date.now
  },
  paymentType: {
    type: String,
    enum: ["دفع شهري", "دفع قسط القرض"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["قيد التأكيد", "عملية الدفع مرفوضة", "تمت العملية بنجاح"],
  },
  voucherReceipt: {
    type: String
  },
  rejectReason: {
    type: String
  }
  ,loanRelated: {
  type: Schema.Types.ObjectId,
  ref: "Loan"
}




})
module.exports = VoucherSchema