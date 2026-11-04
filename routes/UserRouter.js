
const router = require("express").Router()

const controller = require("../controllers/UserController")
const uploadS3 = require("../models/middleware/uploadS3")

router.get("/", controller.GetAllUsers)

router.get("/user/:id", controller.GetUserById)

router.put(
  "/:id",
  uploadS3.fields([
    {
      name: "profilePicture",
      maxCount: 1
    },
    {
      name: "signature",
      maxCount: 1
    }
  ]),
  controller.UpdateUser
)

module.exports = router
