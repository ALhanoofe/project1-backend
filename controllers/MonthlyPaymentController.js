const { MonthlyPayment } = require('../models')

const GetAllMonthlyPayments = async (req, res) => {
  try {
    const monthlyPayments = await MonthlyPayment.find()
    res.status(200).send(monthlyPayments)
  }
  catch (error) {
    throw error
  }

}

const GetMonthlyPaymentById = async (req, res) => {
  try {
    const monthlyPayment = await MonthlyPayment.findById(req.params.id)
    res.status(200).send(monthlyPayment)
  } catch (error) {
    throw error
  }
}

const CreateMonthlyPayment = async (req, res) => {
  try {
    const monthlyPayment = await MonthlyPayment.create(req.body)
    res.status(201).send(monthlyPayment)
  }
  catch (error) {
    throw error
  }

}


const UpdateMonthlyPayment = async (req, res) => {
  try {
    const monthlyPayment = await MonthlyPayment.findByIdAndUpdate
      (req.params.id, req.body, { new: true })      
    res.status(200).send(monthlyPayment)
  }
  catch (error) {
    throw error
  }

}

const DeleteMonthlyPayment = async (req, res) => {
  try {
    await MonthlyPayment.findByIdAndDelete(req.params.id)
    res.status(204).send()
  }
  catch (error) {
    throw error
  }
}


module.exports = {
  GetAllMonthlyPayments,
  GetMonthlyPaymentById,
  CreateMonthlyPayment,
  UpdateMonthlyPayment,
  DeleteMonthlyPayment
}