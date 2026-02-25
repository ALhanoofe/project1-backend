const router = require('express').Router()
const controller = require('../controllers/LoadController')

router.get('/', controller.GetAllLoads)
router.get('/:id', controller.GetLoadById)
router.post('/', controller.CreateLoad)
router.put('/:id', controller.UpdateLoad)
router.delete('/:id', controller.DeleteLoad)

module.exports = router
