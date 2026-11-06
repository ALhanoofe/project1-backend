const { User } = require("../models")
const uploadToS3 = require("../config/uploadToS3")
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
// UPDATE USER
const UpdateUser = async (req, res) => {
  try {
    // Find user
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      })
    }

    // Copy normal form data
    const updateData = { ...req.body }

    // Remove image fields and temporary URLs
    // We only update images when a new file is uploaded
    delete updateData.profilePicture
    delete updateData.signature
    delete updateData.profilePictureUrl
    delete updateData.signatureUrl

    // Update normal user information
    Object.assign(user, updateData)

    // Get uploaded files
    const profileFile = req.files?.profilePicture?.[0]
    const signatureFile = req.files?.signature?.[0]

    // Upload new profile picture only if selected
    if (profileFile) {
      const profileKey = await uploadToS3(
        profileFile,
        "profilePictures"
      )

      user.profilePicture = `s3:${profileKey}`
    }

    // Upload new signature only if a new signature was drawn
    if (signatureFile) {
      const signatureKey = await uploadToS3(
        signatureFile,
        "signatures"
      )

      user.signature = `s3:${signatureKey}`
    }

    // Save user
    await user.save()

    // Return user with signed image URLs
    const userWithImage = await getUserWithProfileUrl(user)

    res.status(200).send(userWithImage)

  } catch (error) {
    console.log("UPDATE USER ERROR:", error)

    res.status(500).send({
      message: error.message,
    })
  }
}
module.exports = {
  GetAllUsers,
  GetUserById,
  UpdateUser,
}
