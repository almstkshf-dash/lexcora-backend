const assetsModel = require("../models/assetsModel");
const accountingService = require("./accountingService");
const db = require("../config/db");

/**
 * Calculates and posts depreciation for all eligible assets.
 * Usually runs monthly.
 */
const runDepreciation = async (createdBy = null) => {
  const assets = await assetsModel.getAllAssets();
  const results = {
    processed: 0,
    skipped: 0,
    errors: []
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  for (const asset of assets) {
    try {
      // Eligibility check: has depreciation rate and current value > salvage value
      if (!asset.depreciation_rate || asset.depreciation_rate <= 0 || 
          parseFloat(asset.current_value) <= parseFloat(asset.salvage_value)) {
        results.skipped++;
        continue;
      }

      // Straight-line monthly depreciation calculation
      // Depreciation = (Purchase Cost - Salvage Value) * (Depreciation Rate / 100) / 12
      const annualDepreciation = (parseFloat(asset.purchase_cost) - parseFloat(asset.salvage_value)) * (parseFloat(asset.depreciation_rate) / 100);
      const monthlyDepreciation = annualDepreciation / 12;

      if (monthlyDepreciation <= 0) {
        results.skipped++;
        continue;
      }

      // Calculate new current value (ensure it doesn't go below salvage value)
      let newCurrentValue = parseFloat(asset.current_value) - monthlyDepreciation;
      if (newCurrentValue < parseFloat(asset.salvage_value)) {
        newCurrentValue = parseFloat(asset.salvage_value);
      }

      // Update asset current value
      await assetsModel.updateAsset(asset.id, {
        ...asset,
        current_value: newCurrentValue
      });

      // Post Journal Entry
      await accountingService.postAutomatedEntry('ASSET_DEPRECIATION', {
        amount: monthlyDepreciation,
        description: `Monthly depreciation for ${asset.name} (${currentMonth + 1}/${currentYear})`,
        name: asset.name,
        credit_account_id: null, // Will use default (Accumulated Depreciation)
        branch_id: asset.branch_id,
        created_by: createdBy
      });

      results.processed++;
    } catch (err) {
      console.error(`Error processing depreciation for asset ${asset.id}:`, err);
      results.errors.push({ assetId: asset.id, error: err.message });
    }
  }

  return results;
};

module.exports = {
  runDepreciation
};
