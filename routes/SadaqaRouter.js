const router = require('express').Router()
const controller = require('../controllers/SettlementController')

router.get('/', controller.GetAllSettlements)


module.exports = router
