const { Schema } = require('mongoose');

const SadaqaSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
phoneNumber: { type: String },
    SubAmount: { type: Number, required: true },
    typeOfSadaqa: { type: String, required: true },
    paymentway: { type: String, required: true },
    PaymentDate: {
      type: Date,
      default: Date.now
    },


  },


)
module.exports = SadaqaSchema
