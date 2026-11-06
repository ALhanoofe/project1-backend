const { User } = require("../models")

const { GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const s3 = require("../config/s3")

const getUserWithProfileUrl = async (user) => {
  const userData = user.toObject ? user.toObject() : { ...user }

  const getImageUrl = async (filePath) => {
    if (!filePath || typeof filePath !== "string") {
      return ""
    }

    if (filePath.startsWith("s3:")) {
      const key = filePath.replace("s3:", "")

      return await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
        }),
        { expiresIn: 3600 }
      )
    }

    return filePath
  }

  userData.profilePictureUrl = await getImageUrl(userData.profilePicture)

  userData.signatureUrl = await getImageUrl(userData.signature)

  return userData
}

// GET ALL USERS
const GetAllUsers = async (req, res) => {
  try {
    const users = await User.find()

    const usersWithImages = await Promise.all(
      users.map((user) => getUserWithProfileUrl(user))
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
        message: "User not found",
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
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })

    if (!updatedUser) {
      return res.status(404).send({
        message: "User not found",
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
  UpdateUser,
}
