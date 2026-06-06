const {Voucher} = require('../models')

const GetVouchers = async (req, res) => {
  try {

    const vouchers = await Voucher.find()
      .populate("userId")

    res.status(200).send(vouchers)

  } catch (error) {
    throw error
  }
}

const GetVoucherById = async (req, res) => {
  try {

    const voucher = await Voucher.findById(req.params.id)
      .populate("userId")

    res.status(200).send(voucher)

  } catch (error) {
    throw error
  }
} 

const CreateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.create(req.body)
    res.status(201).send(voucher)
  }
  catch (error) {
    throw error
  }
}

const UpdateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req
.body, { new: true })
    res.status(200).send(voucher)
  }
  catch (error) {
    throw error
  }

}

const DeleteVoucher = async (req, res) => {
  try {
    await Voucher.findByIdAndDelete(req.params.id)
    res.status(204).send()
  }
  catch (error) {
    throw error
  }
}

module.exports = {
  GetVouchers,
  GetVoucherById,
  CreateVoucher,
  UpdateVoucher,
  DeleteVoucher
}