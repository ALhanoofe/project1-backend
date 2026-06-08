const { Voucher } = require('../models')

const GetVouchers = async (req, res) => {
  try {

    const vouchers = await Voucher.find()
      .populate("userId")

    res.status(200).send(vouchers)

  } catch (error) {
    throw error
  }
}

const GetVoucherByUserId = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ userId: req.params.id })
      .populate("userId");

    res.status(200).send(vouchers);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

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
  GetVoucherByUserId,
  CreateVoucher,
  UpdateVoucher,
  DeleteVoucher
}