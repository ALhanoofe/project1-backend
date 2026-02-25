const router = require('express').Router()
const controller = require('../controllers/MonthlyPaymentController')

router.get('/', controller.GetAllMonthlyPayments)
router.get('/:id', controller.GetMonthlyPaymentById)    
router.post('/', controller.CreateMonthlyPayment)
router.put('/:id', controller.UpdateMonthlyPayment)
router.delete('/:id', controller.DeleteMonthlyPayment)


