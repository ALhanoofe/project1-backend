const { User } = require('../models')

const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).send(users)
  } catch (error) {
    throw error
  }
}


module.exports = {
  GetAllUsers
}



