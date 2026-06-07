const router = require('express').Router()
const controller = require('../controllers/SadaqaController')

router.get('/', controller.GetAllSadaqa)
router.post('/', controller.CreateSadaqa)

module.exports = router