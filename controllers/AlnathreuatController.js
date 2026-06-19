const { Alnathreuat } = require('../models')

const GetAllAlnathreuats = async (req, res) => {
  try {
    const alnathreuats = await Alnathreuat.find().populate('userId')
    res.status(200).send(alnathreuats)
  }
  catch (error) {
    throw error
  }
}

const GetAlnathreuatById = async (req, res) => {
  try {
    const alnathreuats = await Alnathreuat.findById(req.params.id)
      .populate("userId");

    res.status(200).send(alnathreuats);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};



const CreateAlnathreuat = async (req, res) => {
  try {
    const alnathreuat = await Alnathreuat.create(req.body)
    res.status(201).send(alnathreuat)
  } catch (error) {
    throw error
  }
}

const UpdateAlnathreuat = async (req, res) => {
  try {
    const alnathreuat = await Alnathreuat.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).send(alnathreuat)
  } catch (error) {
    throw error
  }
}

const DeleteAlnathreuat = async (req, res) => {
  try {
    await Alnathreuat.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (error) {
    throw error
  }
}


module.exports ={
  GetAllAlnathreuats,
  GetAlnathreuatById,
  CreateAlnathreuat,
  UpdateAlnathreuat,
  DeleteAlnathreuat
}