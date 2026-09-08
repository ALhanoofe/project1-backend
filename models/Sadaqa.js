const { Schema } = require("mongoose");

const SadaqaSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  name: {
    type: String,
  },

  phoneNumber: {
    type: String,
  },

  SubAmount: {
    type: Number,
    required: true,
  },

  typeOfSadaqa: {
    type: String,
    required: true,
  },

  paymentway: {
    type: String,
    required: true,
  },

  PaymentDate: {
    type: Date,
    default: Date.now,
  },

  CPR: {
    type: Number,
  },

  // received = استلام صدقة
  // paid = صرف صدقة
  type: {
    type: String,
    enum: ["received", "paid"],
    default: "received",
  },

  // Only used when type = paid
  reason: {
    type: String,
  },

  // Additional notes for received or paid transactions
notes: {
  type: String,
},


});

module.exports = SadaqaSchema;