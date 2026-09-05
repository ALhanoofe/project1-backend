const { Schema } = require("mongoose");

const AlnathreuatSchema = new Schema(
  {
    item: {
      type: String,
      required: true
    },

    reason: {
      type: String,
      required: true
    },

    Amount: {
      type: Number,
      required: true
    },

    date: {
      type: Date,
      default: Date.now
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    // spent = registered expense
    // request = money request sent to subscribers
    recordType: {
      type: String,
      enum: ["spent", "request"],
      default: "spent"
    },

    // Same ID for all subscribers
    // belonging to the same admin request
    requestGroupId: {
      type: String,
      index: true
    },

    status: {
      type: String,
      enum: [
        "قيد الانتظار",
        "تم القبول",
        "مرفوض"
      ],
      default: "قيد الانتظار"
    },

    rejectReason: {
      type: String
    },

    processedAt: {
      type: Date
    },

    voucherId: {
      type: Schema.Types.ObjectId,
      ref: "Voucher"
    }
  },
  {
    timestamps: true
  }
);

module.exports = AlnathreuatSchema;