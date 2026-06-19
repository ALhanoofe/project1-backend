const router = require('express').Router()
const controller = require('../controllers/AlnathreuatController')

router.get('/', controller.GetAllAlnathreuats)
router.get('/user/:id', controller.GetAlnathreuatById)
router.post('/', controller.CreateAlnathreuat)
router.put('/:id', controller.UpdateAlnathreuat)
router.delete('/:id', controller.DeleteAlnathreuat)

module.exports = router
