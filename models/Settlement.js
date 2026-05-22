const { SettlementSchema } = require('./Settlement')
const { Schema } = require('mongoose');

const SadaqaSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    SubAmount: { type: Number, required: true },
    laodAmount: { type: Number, required: true },
    Date: {
      type: Date,
      default: Date.now
    }
  }

)
module.exports = SadaqaSchema