const { Schema } = require('mongoose');

const SadaqaPageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    SubAmount: { type: Number, required: true },
    typeOfSadaqa: { type: String, required: true },
    paymentway: { type: String, required: true },


  },


)
module.exports = SadaqaPageSchema
