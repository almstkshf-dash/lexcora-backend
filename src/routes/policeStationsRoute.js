
const express = require('express');
const router = express.Router();
const policeStationsController = require('../controllers/policeStationsController');

router.post('/', policeStationsController.addStation);
router.get('/', policeStationsController.getAllStations);
router.put('/:id', policeStationsController.updateStation);
router.delete('/:id', policeStationsController.deleteStation);

module.exports = router;
