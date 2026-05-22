const router = require('express').Router()
const controller = require('../controllers/SettlementController')


router.get('/', controller.GetAllSettlements)
router.post('/', controller.CreateSettlement)


module.exports = router
