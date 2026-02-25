const { Schema } = require('mongoose');

const LoadSchema = new Schema(
  {

    loanAmountNumber: { type: Number, required: true },
    loanAmountString: { type: String, required: true },

    loanReason: { type: String, required: true },
    importantLoan: { type: String, required: true },
    rejectionReason: { type: String },
    loanStatus: { type: String, required: true },
    amountMonthlyPayment: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    receipt: { type: String },
    //تاريخ الاستحقاق 
    dueDate: { type: Date, required: true },
    //تاريخ الطلب
    requestDate: { type: Date, default: Date.now },
    //تاريخ الدفع الشهري
    monthlyPaymentDate: { type: Date },
    //مدة سداد القرض
    loanRepaymentPeriod: { type: Number, required: true }



  },



)
module.exports = LoadSchema
