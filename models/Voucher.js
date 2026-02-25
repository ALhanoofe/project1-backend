const { Schema } = require('mongoose');

const VoucherSchema = new Schema({
    userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
    enum: ["monthlyPayment", "loanPayment"],
    required: true  
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "late"],
  },
  voucherReceipt: {
    type: String
  },
  rejectReason: {
    type: String
  }

  


})
module.exports = VoucherSchema