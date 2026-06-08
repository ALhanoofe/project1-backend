const { Sadaqa } = require('../models')

const GetAllSadaqa = async (req, res) => {
  try {
    const sadaqas = await Sadaqa.find().populate('userId')
    res.status(200).send(sadaqas)
  }
  catch (error) {
    throw error
  }
}

const GetSadaqaById = async (req, res) => {
  try {
    const sadaqa = await Sadaqa.findById(req.params.id)
    res.status(200).send(sadaqa)
  } catch (error) {
    throw error
  }
}

const CreateSadaqa = async (req, res) => {
  try {
    const sadaqa = await Sadaqa.create(req.body)
    res.status(201).send(sadaqa)
  } catch (error) {
    throw error
  }
}

const UpdateSadaqa = async (req, res) => {
  try {
    const sadaqa = await Sadaqa.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).send(sadaqa)
  } catch (error) {
    throw error
  }
}

const DeleteSadaqa = async (req, res) => {
  try {
    await Sadaqa.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (error) {
    throw error
  }
}





module.exports = {
  GetAllSadaqa,
  GetSadaqaById,
  CreateSadaqa,
  UpdateSadaqa,
  DeleteSadaqa

}
