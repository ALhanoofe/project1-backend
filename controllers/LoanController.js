const { Loan } = require('../models')

const GetAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find().populate('userId')
    res.status(200).send(loans)
  }
  catch (error) {
    throw error
  }
}

const GetLoanById = async (req, res) => {
  try {

    const loans = await Loan.findOne({
      userId: req.params.id
    }).populate('userId')

    res.status(200).send(loans)

  } catch (error) {
    throw error
  }
}

const CreateLoan = async (req, res) => {
  try {
    const loan = await Loan.create(req.body)
    res.status(201).send(loan)
  } catch (error) {
    throw error
  }
}

const UpdateLoan = async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).send(loan)
  } catch (error) {
    throw error
  }
}

const DeleteLoan = async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (error) {
    throw error
  }
}





module.exports = {
  GetAllLoans,
  GetLoanById,
  CreateLoan,
  UpdateLoan,
  DeleteLoan

}
