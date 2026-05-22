const router = require('express').Router()
const controller = require('../controllers/UserController')

router.get('/', controller.GetAllUsers)
router.get('/:id', controller.GetUserById)
router.put('/:id', controller.UpdateUser)








module.exports = router