require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const cors = require('cors')






const db = require('./db')

const PORT = process.env.PORT || 3000

const app = express()


app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))











app.get('/', (req, res) => {
  res.send(' API is running')
})


app.listen(PORT, () => {

})
