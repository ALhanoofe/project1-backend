const { Schema } = require('mongoose');

const MonthlyPaymentSchema = new Schema({
  MonthlyPaymentAmount: {
    type: Number,
    required: true
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  subscriptionDate: {
    type: Date,
    default: Date.now
  },

  FirstPaymentDate: {
    type: Date,
    required: true
  },

  monthlyPaymentMonth: {
    type: String,
  },

  receipt: {
    type: String
  },

  status: {
    type: String,
    enum: ["pending", "paid", "late"],
    default: "pending"
  }

})
module.exports = MonthlyPaymentSchema




