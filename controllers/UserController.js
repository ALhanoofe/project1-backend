
const { User } = require('../models')

const { GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const s3 = require("../config/s3")

// إنشاء رابط مؤقت للصورة
const getUserWithProfileUrl = async (user) => {
  const userData = user.toObject
    ? user.toObject()
    : { ...user }

  const image = userData.profilePicture

  if (image && image.startsWith("s3:")) {
    const key = image.replace("s3:", "")

    userData.profilePictureUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key
      }),
      { expiresIn: 3600 }
    )
  } else {
    userData.profilePictureUrl = image || ""
  }

  return userData
}

// GET ALL USERS
const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find()

    const usersWithImages = await Promise.all(
      users.map(user => getUserWithProfileUrl(user))
    )

    res.status(200).send(usersWithImages)

  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
}

// GET USER BY ID
const GetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).send({
        message: "User not found"
      })
    }

    const userWithImage = await getUserWithProfileUrl(user)

    res.status(200).send(userWithImage)

  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
}

// UPDATE USER
const UpdateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).send({
        message: "User not found"
      })
    }

    const userWithImage = await getUserWithProfileUrl(updatedUser)

    res.status(200).send(userWithImage)

  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
}

module.exports = {
  GetAllUsers,
  GetUserById,
  UpdateUser
}
