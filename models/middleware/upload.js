const multer = require("multer")
const path = require("path")
const fs = require("fs")


// ======================================================
// CREATE UPLOAD FOLDERS
// ======================================================

const profileDir = path.join(
  __dirname,
  "../../uploads/profile"
)

const signatureDir = path.join(
  __dirname,
  "../../uploads/signature"
)


// Create folders if they don't exist

if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, {
    recursive: true
  })
}

if (!fs.existsSync(signatureDir)) {
  fs.mkdirSync(signatureDir, {
    recursive: true
  })
}


// ======================================================
// STORAGE
// ======================================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    if (file.fieldname === "profilePicture") {

      cb(null, profileDir)

    } else if (file.fieldname === "signature") {

      cb(null, signatureDir)

    } else {

      cb(
        new Error("Invalid file field")
      )

    }

  },


  filename: (req, file, cb) => {

    const extension =
      path.extname(file.originalname)

    const filename =
      `${file.fieldname}-${Date.now()}-${Math.round(
        Math.random() * 1E9
      )}${extension}`

    cb(
      null,
      filename
    )

  }

})


// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp"
  ]


  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {

    cb(null, true)

  } else {

    cb(
      new Error(
        "Only image files are allowed"
      )
    )

  }

}


// ======================================================
// MULTER
// ======================================================

const upload = multer({

  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024
  }

})


module.exports = upload