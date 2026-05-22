const mongoose = require('mongoose')
const userSchema = require('./User')
const loadSchema = require('./Load')
const voucherSchema = require('./Voucher')
const monthlyPaymentSchema = require('./MonthlyPayment')
const SadaqaSchema = require('./Sadaqa')
const SettlementSchema = require('./Settlement')


const User = mongoose.model('User', userSchema)
const Load = mongoose.model('Load', loadSchema)
const Voucher = mongoose.model('Voucher', voucherSchema)
const MonthlyPayment = mongoose.model('MonthlyPayment', monthlyPaymentSchema)
const Sadaqa = mongoose.model('Sadaqa', SadaqaSchema)
const Settlement = mongoose.model('Settlement', SettlementSchema)


module.exports = {
  User,
  Load,
  Voucher,
  MonthlyPayment,
  Sadaqa,
  Settlement
}


