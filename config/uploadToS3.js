
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const { randomUUID } = require("crypto")
const path = require("path")
const s3 = require("./s3")

const uploadToS3 = async (file, folder) => {
  if (!file) return ""

  const extension = path.extname(file.originalname).toLowerCase()

  const key = `${folder}/${randomUUID()}${extension}`

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  )

  return key
}

module.exports = uploadToS3
