const router = require('express').Router()
const controller = require('../controllers/VoucherController')

router.get('/', controller.GetVouchers)
router.get('/user/:id', controller.GetVoucherByUserId);
router.post('/', controller.CreateVoucher)
router.put('/:id', controller.UpdateVoucher)
router.delete('/:id', controller.DeleteVoucher)


module.exports = router


