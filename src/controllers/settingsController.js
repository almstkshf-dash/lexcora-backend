const SettingsModel = require("../models/settingsModel");

const getSettings = async (req, res) => {
  try {
    const settings = await SettingsModel.getSettings();
    res.success(settings, req.t("settings_fetched"));
  } catch (error) {
    res.fail(req.t("error_fetching_settings"), 500, "SETTINGS_FETCH_ERROR", { error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    await SettingsModel.updateSettings(req.body);
    const updated = await SettingsModel.getSettings();
    res.success(updated, req.t("settings_updated"));
  } catch (error) {
    res.fail(req.t("error_updating_settings"), 500, "SETTINGS_UPDATE_ERROR", { error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
