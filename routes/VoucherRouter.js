const router = require('express').Router()
const controller = require('../controllers/VoucherController')

router.get('/', controller.GetAllVouchers)
router.get('/:id', controller.GetVoucherById)
router.post('/', controller.CreateVoucher)
router.put('/:id', controller.UpdateVoucher)
router.delete('/:id', controller.DeleteVoucher)


