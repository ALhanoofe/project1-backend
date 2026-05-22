const mongoose = require('mongoose')
const userSchema = require('./User')
const loadSchema = require('./Load')
const voucherSchema = require('./Voucher')
const monthlyPaymentSchema = require('./MonthlyPayment')
const SadaqaPageSchema = require('./SadaqaPage')


const User = mongoose.model('User', userSchema)
const Load = mongoose.model('Load', loadSchema)
const Voucher = mongoose.model('Voucher', voucherSchema)
const MonthlyPayment = mongoose.model('MonthlyPayment', monthlyPaymentSchema)
const SadaqaPage = mongoose.model('SadaqaPage', SadaqaPageSchema)


module.exports = {
  User,
  Load,
  Voucher,
  MonthlyPayment,
  SadaqaPage
}


