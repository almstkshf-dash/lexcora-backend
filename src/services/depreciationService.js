const assetsModel = require("../models/assetsModel");
const accountingService = require("./accountingService");
const {
  DEPRECIATION_METHODS,
  calculateStraightLine,
  calculateDecliningBalance,
  getDepreciationSchedule,
  validateDepreciationParams
} = require("../utils/depreciationCalculator");
const db = require("../config/db");

/**
 * Calculate depreciation for a single asset based on its method
 */
const calculateAssetDepreciation = (asset, period = 'monthly') => {
  if (!asset.depreciation_method) {
    asset.depreciation_method = DEPRECIATION_METHODS.STRAIGHT_LINE;
  }

  let depreciation = 0;

  try {
    if (asset.depreciation_method === DEPRECIATION_METHODS.STRAIGHT_LINE) {
      depreciation = calculateStraightLine({
        purchaseCost: asset.purchase_cost,
        salvageValue: asset.salvage_value,
        annualRate: asset.depreciation_rate,
        period
      });
    } else if (asset.depreciation_method === DEPRECIATION_METHODS.DECLINING_BALANCE) {
      depreciation = calculateDecliningBalance({
        bookValue: asset.current_value,
        usefulLife: asset.useful_life || 5,
        salvageValue: asset.salvage_value,
        declineRate: 2,
        period
      });
    }
  } catch (err) {
    console.error(`Error calculating depreciation for asset ${asset.id}:`, err);
    depreciation = 0;
  }

  return Math.max(0, depreciation);
};

/**
 * Calculates and posts depreciation for all eligible assets.
 * Usually runs monthly.
 * Supports multiple depreciation methods per asset.
 */
const runDepreciation = async (createdBy = null) => {
  const assets = await assetsModel.getAllAssets();
  const results = {
    processed: 0,
    skipped: 0,
    errors: [],
    summary: {
      total_depreciation: 0,
      methods_used: {}
    }
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  for (const asset of assets) {
    try {
      // Eligibility check: has depreciation configuration and current value > salvage value
      if (!asset.purchase_cost || asset.purchase_cost <= 0 ||
          parseFloat(asset.current_value) <= parseFloat(asset.salvage_value)) {
        results.skipped++;
        continue;
      }

      // Determine depreciation method
      const method = asset.depreciation_method || DEPRECIATION_METHODS.STRAIGHT_LINE;

      // Calculate monthly depreciation based on method
      const monthlyDepreciation = calculateAssetDepreciation(asset, 'monthly');

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
        description: `Monthly depreciation for ${asset.name} using ${method} method (${currentMonth + 1}/${currentYear})`,
        name: asset.name,
        credit_account_id: null, // Will use default (Accumulated Depreciation)
        branch_id: asset.branch_id,
        created_by: createdBy
      });

      results.processed++;
      results.summary.total_depreciation += monthlyDepreciation;
      results.summary.methods_used[method] = (results.summary.methods_used[method] || 0) + 1;
    } catch (err) {
      console.error(`Error processing depreciation for asset ${asset.id}:`, err);
      results.errors.push({ assetId: asset.id, error: err.message });
    }
  }

  return results;
};

/**
 * Get depreciation schedule for an asset
 */
const getAssetDepreciationSchedule = async (assetId, months = 12) => {
  const asset = await assetsModel.getAssetById(assetId);

  if (!asset) {
    throw new Error('Asset not found');
  }

  const schedule = getDepreciationSchedule({
    purchaseCost: asset.purchase_cost,
    salvageValue: asset.salvage_value,
    usefulLife: asset.useful_life || 5,
    annualRate: asset.depreciation_rate || 0,
    method: asset.depreciation_method || DEPRECIATION_METHODS.STRAIGHT_LINE,
    purchaseDate: asset.purchase_date,
    periods: months,
    periodType: 'month'
  });

  return schedule;
};

/**
 * Calculate depreciation for current month for an asset
 */
const calculateCurrentMonthDepreciation = async (assetId) => {
  const asset = await assetsModel.getAssetById(assetId);

  if (!asset) {
    throw new Error('Asset not found');
  }

  const depreciation = calculateAssetDepreciation(asset, 'monthly');

  return {
    assetId: asset.id,
    assetName: asset.name,
    method: asset.depreciation_method || DEPRECIATION_METHODS.STRAIGHT_LINE,
    monthlyDepreciation: Math.round(depreciation * 100) / 100,
    currentValue: asset.current_value,
    newValue: Math.max(
      parseFloat(asset.salvage_value) || 0,
      parseFloat(asset.current_value) - depreciation
    ),
    purchaseCost: asset.purchase_cost,
    salvageValue: asset.salvage_value
  };
};

/**
 * Validate and update asset depreciation settings
 */
const updateAssetDepreciationSettings = async (assetId, settings) => {
  const { depreciation_method, depreciation_rate, useful_life, salvage_value } = settings;

  // Validate parameters
  const validation = validateDepreciationParams({
    purchaseCost: settings.purchase_cost,
    method: depreciation_method,
    annualRate: depreciation_rate,
    usefulLife: useful_life,
    salvageValue: salvage_value
  });

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const asset = await assetsModel.getAssetById(assetId);
  if (!asset) {
    throw new Error('Asset not found');
  }

  const updateData = {
    ...asset,
    depreciation_method,
    depreciation_rate: depreciation_rate || asset.depreciation_rate,
    useful_life: useful_life || asset.useful_life,
    salvage_value: salvage_value !== undefined ? salvage_value : asset.salvage_value
  };

  await assetsModel.updateAsset(assetId, updateData);

  return updateData;
};

module.exports = {
  runDepreciation,
  calculateAssetDepreciation,
  getAssetDepreciationSchedule,
  calculateCurrentMonthDepreciation,
  updateAssetDepreciationSettings,
  DEPRECIATION_METHODS
};
