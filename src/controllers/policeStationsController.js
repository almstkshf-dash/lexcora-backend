const policeStationsService = require('../services/policeStationsService');


const addStation = async (req, res) => {
    try {
        const stationId = await policeStationsService.addStation(req.body);
        res.status(201).json({ id: stationId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add station' });
    }
};

const getAllStations = async (req, res) => {
    try {
        const stations = await policeStationsService.getAllStations();
        res.status(200).json({ success: true, data: stations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve stations', error: error.message });
    }
};

const updateStation = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await policeStationsService.updateStation(id, req.body);
        if (success) {
            res.status(200).json({ message: 'Station updated successfully' });
        } else {
            res.status(404).json({ error: 'Station not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update station' });
    }
};

const deleteStation = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await policeStationsService.deleteStation(id);
        if (success) {
            res.status(200).json({ message: 'Station deleted successfully' });
        } else {
            res.status(404).json({ error: 'Station not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete station' });
    }
};

module.exports = {
    addStation,
    getAllStations,
    updateStation,
    deleteStation
};
