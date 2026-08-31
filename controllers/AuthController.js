const {
  User,
  MonthlyPayment
} = require("../models")

const middleware =
  require("../models/middleware")

const fs = require("fs")
const path = require("path")


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
      departmentNo,
      city,
      mailboxNo,

      userbalance,
      projectType,

      exName,
      exPhoneNumber,
      exCpr,
      exRelation,
      exOfficeNo,
      exHomeNo,
      exFoxNo,

      signature

    } = req.body


    // ==================================================
    // REQUIRED DATA
    // ==================================================

    if (!CPR || !password) {

      return res.status(400).send({
        msg: "CPR and password are required"
      })

    }


    // ==================================================
    // CPR
    // ==================================================

    CPR = Number(CPR)

    if (isNaN(CPR)) {

      return res.status(400).send({
        msg: "Invalid CPR"
      })

    }


    // ==================================================
    // CHECK CPR
    // ==================================================

    const cprExists =
      await User.findOne({
        CPR
      })

    if (cprExists) {

      return res.status(400).send({
        msg: "CPR already exists"
      })

    }


    // ==================================================
    // PASSWORD
    // ==================================================

    const passwordDigest =
      await middleware.hashPassword(
        password
      )


    // ==================================================
    // DATE
    // ==================================================

    const subscriptionDate =
      new Date()


    // ==================================================
    // PROFILE PICTURE
    // ==================================================

    let profilePicture = ""

    if (
      req.files &&
      req.files.profilePicture &&
      req.files.profilePicture[0]
    ) {

      profilePicture =
        `/uploads/profile/${req.files.profilePicture[0].filename}`

    }


    // ==================================================
    // SIGNATURE
    // ==================================================

    let signatureValue = ""


    // --------------------------------------------------
    // Option 1:
    // Signature sent as Base64 from SignatureCanvas
    // --------------------------------------------------

    if (
      signature &&
      typeof signature === "string" &&
      signature.startsWith("data:image/")
    ) {

      signatureValue = signature

    }


    // --------------------------------------------------
    // Option 2:
    // Signature uploaded as a file
    // --------------------------------------------------

    else if (
      req.files &&
      req.files.signature &&
      req.files.signature[0]
    ) {

      signatureValue =
        `/uploads/signature/${req.files.signature[0].filename}`

    }


    // ==================================================
    // CREATE USER
    // ==================================================

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

      departmentNo,

      city,

      mailboxNo,

      userbalance,

      projectType,

      exName,

      exCpr,

      exRelation,

      exPhoneNumber,

      exOfficeNo,

      exHomeNo,

      exFoxNo,

      status: "pending",

      role: "user",

      memberStatus: "مشترك",

      subscriptionDate

    })


    // ==================================================
    // CREATE MONTHLY PAYMENT
    // ======================================================

    await MonthlyPayment.create({

      MonthlyPaymentAmount: 5,

      userId: user._id,

      subscriptionDate,

      FirstPaymentDate:
        subscriptionDate,

      monthlyPaymentMonth:
        subscriptionDate.toLocaleString(
          "ar",
          {
            month: "long"
          }
        ),

      paymentYear:
        subscriptionDate.getFullYear(),

      paymentMonth:
        subscriptionDate.getMonth() + 1

    })


    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).send(user)

  } catch (error) {

    console.log(
      "REGISTER ERROR:",
      error
    )

    return res.status(500).send({
      msg: "Server error",
      error: error.message
    })

  }

}


// ======================================================
// LOGIN
// ======================================================

const Login = async (req, res) => {

  try {

    let {
      CPR,
      password
    } = req.body


    CPR = Number(CPR)


    const user =
      await User.findOne({
        CPR
      })


    if (!user) {

      return res.status(404).send({

        status: "Error",

        msg: "User not found"

      })

    }


    const matched =
      await middleware.comparePassword(
        password,
        user.password
      )


    if (!matched) {

      return res.status(401).send({

        status: "Error",

        msg: "Wrong password"

      })

    }


    // ==================================================
    // TOKEN
    // ==================================================

    const payload = {

      id: user._id,

      name: user.memberName,

      cpr: user.CPR,

      email: user.memberEmail,

      phoneNumber:
        user.phoneNumber,

      status: user.status

    }


    const token =
      middleware.createToken(
        payload
      )


    return res.status(200).send({

      user,

      token

    })

  } catch (error) {

    console.log(
      "LOGIN ERROR:",
      error
    )

    return res.status(500).send({

      status: "Error",

      msg: "Server error"

    })

  }

}


// ======================================================
// GET USER BY ID
// ======================================================

const GetUserById = async (req, res) => {

  try {

    const user =
      await User.findById(
        req.params.id
      )


    if (!user) {

      return res.status(404).send({

        msg: "User not found"

      })

    }


    return res.status(200).send(user)

  } catch (error) {

    console.log(
      "GET USER ERROR:",
      error
    )

    return res.status(500).send({

      msg: "Error getting user"

    })

  }

}


// ======================================================
// CHECK SESSION
// ======================================================

const CheckSession = async (req, res) => {

  try {

    const user =
      await User.findById(
        res.locals.payload.id
      )


    if (!user) {

      return res.status(404).send({

        msg: "User not found"

      })

    }


    return res.status(200).send(user)

  } catch (error) {

    console.log(
      "CHECK SESSION ERROR:",
      error
    )

    return res.status(500).send({

      msg: "Session error"

    })

  }

}


// ======================================================
// DELETE OLD FILE
// ======================================================

const deleteOldFile = (
  filePath
) => {

  try {

    if (!filePath) {
      return
    }


    // Don't delete Base64 signature
    if (
      filePath.startsWith(
        "data:"
      )
    ) {

      return

    }


    // Don't delete URL
    if (
      filePath.startsWith(
        "http://"
      ) ||
      filePath.startsWith(
        "https://"
      )
    ) {

      return

    }


    const cleanPath =
      filePath.startsWith("/")
        ? filePath.substring(1)
        : filePath


    const fullPath =
      path.join(
        __dirname,
        "..",
        cleanPath
      )


    if (
      fs.existsSync(fullPath)
    ) {

      fs.unlinkSync(
        fullPath
      )

    }

  } catch (error) {

    console.log(
      "DELETE OLD FILE ERROR:",
      error
    )

  }

}


// ======================================================
// UPDATE USER
// ======================================================

const UpdateUser = async (req, res) => {

  try {

    const {
      id
    } = req.params


    // ==================================================
    // FIND USER
    // ==================================================

    const user =
      await User.findById(id)


    if (!user) {

      return res.status(404).send({

        msg: "User not found"

      })

    }


    // ==================================================
    // REQUEST DATA
    // ==================================================

    const {
      newPassword,

      signature,

      ...data

    } = req.body


    // ==================================================
    // REMOVE PROTECTED FIELDS
    // ==================================================

    delete data._id

    delete data.__v

    delete data.password

    delete data.profilePicture


    // ==================================================
    // NORMAL FIELDS
    // ==================================================

    Object.assign(
      user,
      data
    )


    // ==================================================
    // PROFILE PICTURE
    // ==================================================

    if (
      req.files &&
      req.files.profilePicture &&
      req.files.profilePicture[0]
    ) {

      // Delete old profile picture
      deleteOldFile(
        user.profilePicture
      )


      user.profilePicture =
        `/uploads/profile/${req.files.profilePicture[0].filename}`

    }


    // ==================================================
    // SIGNATURE
    // ==================================================

    // --------------------------------------------------
    // USER SIGNATURE FROM SignatureCanvas
    // --------------------------------------------------

    if (
      signature &&
      typeof signature === "string" &&
      signature.startsWith("data:image/")
    ) {

      console.log(
        "SIGNATURE RECEIVED FROM USER"
      )


      // If old signature is a file,
      // delete the old file first
      deleteOldFile(
        user.signature
      )


      // Save Base64 signature
      user.signature =
        signature

    }


    // --------------------------------------------------
    // SIGNATURE FILE
    // --------------------------------------------------

    else if (
      req.files &&
      req.files.signature &&
      req.files.signature[0]
    ) {

      console.log(
        "SIGNATURE FILE RECEIVED"
      )


      // Delete old signature file
      deleteOldFile(
        user.signature
      )


      user.signature =
        `/uploads/signature/${req.files.signature[0].filename}`

    }


    // ==================================================
    // PASSWORD
    // ==================================================

    if (
      newPassword &&
      typeof newPassword === "string" &&
      newPassword.trim()
    ) {

      user.password =
        await middleware.hashPassword(
          newPassword.trim()
        )

    }


    // ==================================================
    // SAVE USER
    // ==================================================

    await user.save()


    // ==================================================
    // RESPONSE
    // ==================================================

    console.log(
      "USER UPDATED SUCCESSFULLY"
    )

    console.log(
      "SIGNATURE SAVED:",
      user.signature
        ? "YES"
        : "NO"
    )


    return res.status(200).send(user)

  } catch (error) {

    console.log(
      "===================================="
    )

    console.log(
      "UPDATE USER ERROR:"
    )

    console.log(
      error
    )

    console.log(
      "===================================="
    )


    return res.status(500).send({

      msg: "Update failed",

      error: error.message

    })

  }

}


// ======================================================
// UPDATE PASSWORD
// ======================================================

const UpdatePassword = async (req, res) => {

  try {

    const {
      oldPassword,
      newPassword
    } = req.body


    const user =
      await User.findById(
        req.params.id
      )


    if (!user) {

      return res.status(404).send({

        msg: "User not found"

      })

    }


    const matched =
      await middleware.comparePassword(
        oldPassword,
        user.password
      )


    if (!matched) {

      return res.status(401).send({

        msg: "Wrong password"

      })

    }


    user.password =
      await middleware.hashPassword(
        newPassword
      )


    await user.save()


    return res.status(200).send({

      status:
        "Password Updated Successfully"

    })

  } catch (error) {

    console.log(
      "UPDATE PASSWORD ERROR:",
      error
    )

    return res.status(500).send({

      msg:
        "Update password failed"

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

  GetUserById

}