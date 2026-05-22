const { Load } = require('../models')

const GetAllLoads = async (req, res) => {
  try {
    const loads = await Load.find()
    res.status(200).send(loads)
  }
  catch (error) {
    throw error
  }
}

const GetLoadById = async (req, res) => {
  try {
    const loads = await Load.findOne({ userId: req.params.id })
    res.status(200).send(loads)
  } catch (error) {
    throw error
  }
}

const CreateLoad = async (req, res) => {
  try {
    const load = await Load.create(req.body)
    res.status(201).send(load)
  } catch (error) {
    throw error
  }
}

const UpdateLoad = async (req, res) => {
  try {
    const load = await Load.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).send(load)
  } catch (error) {
    throw error
  }
}

const DeleteLoad = async (req, res) => {
  try {
    await Load.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (error) {
    throw error
  }
}





module.exports = {
  GetAllLoads,
  GetLoadById,
  CreateLoad,
  UpdateLoad,
  DeleteLoad

}
