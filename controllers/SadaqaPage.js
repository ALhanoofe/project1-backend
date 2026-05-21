const { SadaqaPage } = require('../models')

const GetAllSadaqaPages = async (req, res) => {
  try {
    const loads = await SadaqaPage.find()
    res.status(200).send(loads)
  }
  catch (error) {
    throw error
  }
}

const GetSadaqaPageById = async (req, res) => {
  try {
    const loads = await SadaqaPage.findById(req.params.id)
    res.status(200).send(loads)
  } catch (error) {
    throw error
  }
}

const CreateSadaqaPage = async (req, res) => {
  try {
    const load = await SadaqaPage.create(req.body)
    res.status(201).send(load)
  } catch (error) {
    throw error
  }
}

const UpdateSadaqaPage = async (req, res) => {
  try {
    const load = await SadaqaPage.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).send(load)
  } catch (error) {
    throw error
  }
}

const DeleteSadaqaPage = async (req, res) => {
  try {
    await SadaqaPage.findByIdAndDelete(req.params.id)
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
