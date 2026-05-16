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
    enum: ["دفع شهري", "دفع قسط القرض "],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["جديد", "قيد التأكيد", "عملية الدفع مرفوضة", "تمت العملية بنجاح"],
  },
  voucherReceipt: {
    type: String
  },
  rejectReason: {
    type: String
  }




})
module.exports = VoucherSchema