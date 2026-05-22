const {Settlement} = require('../models')

const GetAllSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find()
    res.status(200).send(settlements)
  }
  catch (error) {
    throw error
  }
}

const CreateSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.create(req.body)
    res.status(201).send(settlement)
  } catch (error) {
    throw error
  }
}





module.exports = {
  GetAllSettlements,
  CreateSettlement
}