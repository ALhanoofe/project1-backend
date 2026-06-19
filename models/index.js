const mongoose = require('mongoose')
const userSchema = require('./User')
const loanSchema = require('./Loan')
const voucherSchema = require('./Voucher')
const monthlyPaymentSchema = require('./MonthlyPayment')
const SadaqaSchema = require('./Sadaqa')
const AlnathreuatSchema = require('./Alnathreuat')



const User = mongoose.model('User', userSchema)
const Loan = mongoose.model('Loan', loanSchema)
const Voucher = mongoose.model('Voucher', voucherSchema)
const MonthlyPayment = mongoose.model('MonthlyPayment', monthlyPaymentSchema)
const Sadaqa = mongoose.model('Sadaqa', SadaqaSchema)

const Alnathreuat = mongoose.model('Alnathreuat', AlnathreuatSchema)



module.exports = {
  User,
  Loan,
  Voucher,
  MonthlyPayment,
  Sadaqa,
  Alnathreuat
}


