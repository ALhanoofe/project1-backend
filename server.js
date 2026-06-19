require('dotenv').config()
const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const AuthRouter = require('./routes/AuthRouter')
const LoanRouter = require('./routes/LoanRouter')
const MonthlyPaymentRouter = require('./routes/MonthlyPaymentRouter')
const VoucherRouter = require('./routes/VoucherRouter')
const UserRouter = require('./routes/UserRouter')
const SadaqaRouter = require('./routes/SadaqaRouter')
const AlnathreuatRouter = require('./routes/AlnathreuatRouter')



const db = require('./db')

const PORT = process.env.PORT || 3000

const app = express()


app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))



app.use('/auth', AuthRouter)
app.use('/loan', LoanRouter)
app.use('/monthlyPayments', MonthlyPaymentRouter)
app.use('/vouchers', VoucherRouter)
app.use('/users', UserRouter)
app.use('/sadaqa', SadaqaRouter)
app.use('/alnathreuat', AlnathreuatRouter)




app.get('/', (req, res) => {
  res.send(' API is running')
})


app.listen(PORT, () => {

})
