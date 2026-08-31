const router = require("express").Router()

const controller =
  require("../controllers/AuthController")

const middleware =
  require("../models/middleware")

const upload =
  require("../models/middleware/upload")


// ======================================================
// REGISTER
// ======================================================

router.post(
  "/register",
  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1
    },
    {
      name: "signature",
      maxCount: 1
    }
  ]),
  controller.Register
)


// ======================================================
// LOGIN
// ======================================================

router.post(
  "/login",
  controller.Login
)


// ======================================================
// UPDATE PASSWORD
// ======================================================

router.put(
  "/update/:id",
  middleware.stripToken,
  middleware.verifyToken,
  controller.UpdatePassword
)


// ======================================================
// SESSION
// ======================================================

router.get(
  "/session",
  middleware.stripToken,
  middleware.verifyToken,
  controller.CheckSession
)


// ======================================================
// UPDATE USER
// ======================================================
router.put(
  "/update-user/:id",

  upload.fields([
    {
      name: "profilePicture",
      maxCount: 1
    }
  ]),

  controller.UpdateUser
)


// ======================================================
// GET USER
// ======================================================

router.get(
  "/user/:id",
  controller.GetUserById
)


// ======================================================
// UPDATE PASSWORD
// ======================================================

router.put(
  "/update-password/:id",
  controller.UpdatePassword
)


module.exports = router