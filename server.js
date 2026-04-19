require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const AuthRouter = require('./routes/AuthRouter')
const LoadRouter = require('./routes/LoadRouter')
const MonthlyPaymentRouter = require('./routes/MonthlyPaymentRouter')
const VoucherRouter = require('./routes/VoucherRouter')






const db = require('./db')

const PORT = process.env.PORT || 3000

const app = express()



app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))



app.use('/auth', AuthRouter)
app.use('/loads', LoadRouter)
app.use('/monthlyPayments', MonthlyPaymentRouter)
app.use('/vouchers', VoucherRouter)




app.get('/', (req, res) => {
  res.send(' API is running')
})


app.listen(PORT, () => {

})
