const router = require('express').Router()
const controller = require('../controllers/LoanController')

router.get('/', controller.GetAllLoans)
router.get('/user/:userId', controller.GetLoanByUserId)
router.get('/:id', controller.GetLoanById)
router.post('/', controller.CreateLoan)
router.put('/:id', controller.UpdateLoan)
router.delete('/:id', controller.DeleteLoan)

module.exports = router