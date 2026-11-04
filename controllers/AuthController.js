
const { User, MonthlyPayment } = require("../models")
const middleware = require("../models/middleware")
const fs = require("fs")
const path = require("path")
const uploadToS3 = require("../config/uploadToS3")

const { GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const s3 = require("../config/s3")

// ======================================================
// GET USER WITH PROFILE URL
// ======================================================

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
        Key: key,
      }),
      { expiresIn: 3600 }
    )
  } else {
    userData.profilePictureUrl = image || ""
  }

  return userData
}

// ======================================================
// REGISTER
// ======================================================

const Register = async (req, res) => {
  try {
    let {
      memberName,
      memberEmail,
      CPR,
      password,
      bankName,
      ibanNo,
      phoneNumber,
      extraNumber,
      homeNumber,
      officeNumber,
      faxNumber,
      buildingNo,
      blockNo,
      rodeNo,
      flatNo,
      city,
      mailboxNo,
      userbalance,
      projectType,
      signature,
      projectPersonName,
      projectPersonCpr,
      projectPersonRelation,
      projectPersonPhone,
    } = req.body

    if (
      CPR === undefined ||
      CPR === null ||
      !String(CPR).trim() ||
      !password ||
      !String(password).trim()
    ) {
      return res.status(400).send({
        msg: "CPR and password are required",
      })
    }

    CPR = String(CPR).trim()

    if (!/^\d+$/.test(CPR)) {
      return res.status(400).send({
        msg: "Invalid CPR",
      })
    }

    const cprExists = await User.findOne({ CPR })

    if (cprExists) {
      return res.status(400).send({
        msg: "CPR already exists",
      })
    }

    const passwordDigest = await middleware.hashPassword(password)
    const subscriptionDate = new Date()

    // PROFILE PICTURE

    let profilePicture = ""

    if (req.files?.profilePicture?.[0]) {
      const key = await uploadToS3(req.files.profilePicture[0], "profile")
      profilePicture = `s3:${key}`
      console.log("PROFILE S3 KEY:", key)
    }

    // SIGNATURE

    let signatureValue = ""

    if (
      signature &&
      typeof signature === "string" &&
      signature.startsWith("data:image/")
    ) {
      signatureValue = signature
    } else if (req.files?.signature?.[0]) {
      const key = await uploadToS3(req.files.signature[0], "signature")
      signatureValue = `s3:${key}`
    }

    // CREATE USER

    const user = await User.create({
      memberName,
      memberEmail,
      CPR,
      password: passwordDigest,
      profilePicture,
      signature: signatureValue,
      bankName,
      ibanNo,
      phoneNumber,
      extraNumber,
      homeNumber,
      officeNumber,
      faxNumber,
      buildingNo,
      blockNo,
      rodeNo,
      flatNo,
      city,
      mailboxNo,
      userbalance,
      projectType,
      status: "pending",
      role: "user",
      memberStatus: "مشترك",
      subscriptionDate,
      projectPersonName,
      projectPersonCpr,
      projectPersonRelation,
      projectPersonPhone,
    })

    // CREATE MONTHLY PAYMENT

    await MonthlyPayment.create({
      MonthlyPaymentAmount: 5,
      userId: user._id,
      subscriptionDate,
      FirstPaymentDate: subscriptionDate,
      monthlyPaymentMonth: subscriptionDate.toLocaleString("ar", {
        month: "long",
      }),
      paymentYear: subscriptionDate.getFullYear(),
      paymentMonth: subscriptionDate.getMonth() + 1,
    })

    return res.status(201).send(
      await getUserWithProfileUrl(user)
    )
  } catch (error) {
    console.log("REGISTER ERROR:", error)

    return res.status(500).send({
      msg: "Server error",
      error: error.message,
    })
  }
}

// ======================================================
// LOGIN
// ======================================================

const Login = async (req, res) => {
  try {
    let { CPR, password } = req.body

    CPR = String(CPR ?? "").trim()

    if (!CPR || !/^\d+$/.test(CPR) || !password) {
      return res.status(400).send({
        status: "Error",
        msg: "Invalid CPR or password",
      })
    }

    const user = await User.findOne({ CPR })

    if (!user) {
      return res.status(404).send({
        status: "Error",
        msg: "User not found",
      })
    }

    const matched = await middleware.comparePassword(
      password,
      user.password
    )

    if (!matched) {
      return res.status(401).send({
        status: "Error",
        msg: "Wrong password",
      })
    }

    const payload = {
      id: user._id,
      name: user.memberName,
      cpr: user.CPR,
      email: user.memberEmail,
      phoneNumber: user.phoneNumber,
      status: user.status,
    }

    const token = middleware.createToken(payload)

    return res.status(200).send({
      user: await getUserWithProfileUrl(user),
      token,
    })
  } catch (error) {
    console.log("LOGIN ERROR:", error)

    return res.status(500).send({
      status: "Error",
      msg: "Server error",
    })
  }
}

// ======================================================
// GET USER BY ID
// ======================================================

const GetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
      })
    }

    return res.status(200).send(
      await getUserWithProfileUrl(user)
    )
  } catch (error) {
    console.log("GET USER ERROR:", error)

    return res.status(500).send({
      msg: "Error getting user",
    })
  }
}

// ======================================================
// CHECK SESSION
// ======================================================

const CheckSession = async (req, res) => {
  try {
    const user = await User.findById(res.locals.payload.id)

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
      })
    }

    return res.status(200).send(
      await getUserWithProfileUrl(user)
    )
  } catch (error) {
    console.log("CHECK SESSION ERROR:", error)

    return res.status(500).send({
      msg: "Session error",
    })
  }
}

// ======================================================
// DELETE OLD FILE
// ======================================================

const deleteOldFile = (filePath) => {
  try {
    if (!filePath) return

    if (
      filePath.startsWith("data:") ||
      filePath.startsWith("s3:") ||
      filePath.startsWith("http://") ||
      filePath.startsWith("https://")
    ) {
      return
    }

    const cleanPath = filePath.startsWith("/")
      ? filePath.substring(1)
      : filePath

    const fullPath = path.join(__dirname, "..", cleanPath)

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
  } catch (error) {
    console.log("DELETE OLD FILE ERROR:", error)
  }
}

// ======================================================
// UPDATE USER
// ======================================================

const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
      })
    }

    const { newPassword, signature, ...data } = req.body

    delete data._id
    delete data.__v
    delete data.password
    delete data.profilePicture

    if (data.CPR !== undefined && data.CPR !== null) {
      data.CPR = String(data.CPR).trim()

      if (!/^\d+$/.test(data.CPR)) {
        return res.status(400).send({
          msg: "Invalid CPR",
        })
      }
    }

    Object.assign(user, data)

    // PROFILE PICTURE - S3

    if (req.files?.profilePicture?.[0]) {
      const key = await uploadToS3(
        req.files.profilePicture[0],
        "profile"
      )

      user.profilePicture = `s3:${key}`

      console.log("PROFILE S3 KEY:", key)
      console.log("PROFILE SAVED:", user.profilePicture)
    }

    // SIGNATURE

    if (
      signature &&
      typeof signature === "string" &&
      signature.startsWith("data:image/")
    ) {
      user.signature = signature
    } else if (req.files?.signature?.[0]) {
      const key = await uploadToS3(
        req.files.signature[0],
        "signature"
      )

      user.signature = `s3:${key}`
    }

    // PASSWORD

    if (
      newPassword &&
      typeof newPassword === "string" &&
      newPassword.trim()
    ) {
      user.password = await middleware.hashPassword(
        newPassword.trim()
      )
    }

    await user.save()

    console.log("USER UPDATED SUCCESSFULLY")
    console.log("SIGNATURE SAVED:", user.signature ? "YES" : "NO")

    return res.status(200).send(
      await getUserWithProfileUrl(user)
    )
  } catch (error) {
    console.log("UPDATE USER ERROR:", error)

    return res.status(500).send({
      msg: "Update failed",
      error: error.message,
    })
  }
}

// ======================================================
// UPDATE PASSWORD
// ======================================================

const UpdatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
      })
    }

    const matched = await middleware.comparePassword(
      oldPassword,
      user.password
    )

    if (!matched) {
      return res.status(401).send({
        msg: "Wrong password",
      })
    }

    user.password = await middleware.hashPassword(newPassword)

    await user.save()

    return res.status(200).send({
      status: "Password Updated Successfully",
    })
  } catch (error) {
    console.log("UPDATE PASSWORD ERROR:", error)

    return res.status(500).send({
      msg: "Update password failed",
    })
  }
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  Register,
  Login,
  UpdatePassword,
  CheckSession,
  UpdateUser,
  GetUserById,
}
