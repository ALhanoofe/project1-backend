const router = require('express').Router()
const controller = require('../controllers/SadaqaController')

router.get('/', controller.GetAllSadaqa)


module.exports = router
