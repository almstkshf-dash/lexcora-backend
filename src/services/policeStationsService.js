const policeStationsModel = require('../models/policeStationsModel');


const addStation = async (station) => {
    return await policeStationsModel.addStation(station);
};

const getAllStations = async () => {
    return await policeStationsModel.getAllStations();
};

const updateStation = async (id, updatedStation) => {
    return await policeStationsModel.updateStation(id, updatedStation);
};

const deleteStation = async (id) => {
    return await policeStationsModel.deleteStation(id);
};

module.exports = {
    addStation,
    getAllStations,
    updateStation,
    deleteStation
};
