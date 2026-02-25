const mongoose = require('mongoose')
const userSchema = require('./User')
const loadSchema = require('./Load')
const voucherSchema = require('./Voucher')
const monthlyPaymentSchema = require('./MonthlyPayment')

const User = mongoose.model('User', userSchema)
const Load = mongoose.model('Load', loadSchema)
const Voucher = mongoose.model('Voucher', voucherSchema)
const MonthlyPayment = mongoose.model('MonthlyPayment', monthlyPaymentSchema)

module.exports = {
  User,
  Load,
  Voucher,
  MonthlyPayment

}


