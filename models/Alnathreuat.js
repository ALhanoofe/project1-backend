const { Schema } = require('mongoose')

const AlnathreuatSchema = new Schema(
  {
    item: { type: String },
    reason: { type: String },
    Amount: { type: Number },
    date: { type: Date },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },

  }
)
module.exports = AlnathreuatSchema