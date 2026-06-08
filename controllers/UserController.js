const { User } = require('../models')

const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).send(users)
  } catch (error) {
    throw error
  }
}


const GetUserById = async (req, res) => {
  try {

    const user = await User.findOne({
      CPR: Number(req.params.id)
    })

    if (!user) {
      return res.status(404).send({
        message: "User not found"
      })
    }

    res.status(200).send(user)

  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
}

const UpdateUser = async (req, res) => {
  try {

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    res.send(updatedUser)

  } catch (error) {
    res.status(500).send(error)
  }
}



module.exports = {
  GetAllUsers,
  GetUserById,
  UpdateUser

}



