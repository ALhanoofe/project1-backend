const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)
const APP_SECRET = process.env.APP_SECRET

// =======================
// HASH PASSWORD
// =======================
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

// =======================
// COMPARE PASSWORD
// =======================
const comparePassword = async (password, storedPassword) => {
  return await bcrypt.compare(password, storedPassword)
}

// =======================
// CREATE TOKEN
// =======================
const createToken = (payload) => {
  return jwt.sign(payload, APP_SECRET)
}

// =======================
// STRIP TOKEN (FIXED)
// =======================
const stripToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  // 1. تحقق من وجود الهيدر
  if (!authHeader) {
    return res.status(401).send({
      status: 'Error',
      msg: 'No Authorization header'
    })
  }

  // 2. تحقق من الفورمات (Bearer token)
  const parts = authHeader.split(' ')

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).send({
      status: 'Error',
      msg: 'Invalid token format'
    })
  }

  const token = parts[1]

  // 3. تحقق من وجود التوكن
  if (!token) {
    return res.status(401).send({
      status: 'Error',
      msg: 'Token missing'
    })
  }

  // 4. خزنه
  res.locals.token = token
  next()
}

// =======================
// VERIFY TOKEN
// =======================
const verifyToken = (req, res, next) => {
  const token = res.locals.token

  if (!token) {
    return res.status(401).send({
      status: 'Error',
      msg: 'No token to verify'
    })
  }

  try {
    const payload = jwt.verify(token, APP_SECRET)
    res.locals.payload = payload
    next()
  } catch (error) {
    console.log(error)
    return res.status(401).send({
      status: 'Error',
      msg: 'Invalid token'
    })
  }
}

// =======================
// EXPORT
// =======================
module.exports = {
  hashPassword,
  comparePassword,
  createToken,
  stripToken,
  verifyToken
}