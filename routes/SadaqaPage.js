const router = require('express').Router()
const controller = require('../controllers/SadaqaPageController')

router.get('/', controller.GetAllSadaqaPages)
router.get('/:id', controller.GetSadaqaPageById)
router.post('/', controller.CreateSadaqaPage)
router.put('/:id', controller.UpdateSadaqaPage)
router.delete('/:id', controller.DeleteSadaqaPage)

module.exports = router
