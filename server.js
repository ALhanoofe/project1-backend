require("dotenv").config()

const express = require("express")
const logger = require("morgan")
const cors = require("cors")
const path = require("path")

const AuthRouter =
  require("./routes/AuthRouter")

const LoanRouter =
  require("./routes/LoanRouter")

const MonthlyPaymentRouter =
  require("./routes/MonthlyPaymentRouter")

const VoucherRouter =
  require("./routes/VoucherRouter")

const UserRouter =
  require("./routes/UserRouter")

const SadaqaRouter =
  require("./routes/SadaqaRouter")

const AlnathreuatRouter =
  require("./routes/AlnathreuatRouter")


const db = require("./db")


const PORT =
  process.env.PORT || 3000


const app = express()


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors())

app.use(logger("dev"))

app.use(express.json())

app.use(
  express.urlencoded({
    extended: true
  })
)


// ======================================================
// UPLOADS
// ======================================================

// Makes /uploads accessible

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
)


// ======================================================
// ROUTES
// ======================================================

app.use(
  "/auth",
  AuthRouter
)

app.use(
  "/loan",
  LoanRouter
)

app.use(
  "/monthlyPayments",
  MonthlyPaymentRouter
)

app.use(
  "/vouchers",
  VoucherRouter
)

app.use(
  "/users",
  UserRouter
)

app.use(
  "/sadaqa",
  SadaqaRouter
)

app.use(
  "/alnathreuat",
  AlnathreuatRouter
)


// ======================================================
// TEST
// ======================================================

app.get(
  "/",
  (req, res) => {

    res.send(
      "API is running"
    )

  }
)


// ======================================================
// START
// ======================================================

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on http://localhost:${PORT}`
    )

  }
)