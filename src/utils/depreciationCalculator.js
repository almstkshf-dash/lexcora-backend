/**
 * Depreciation Calculator Utilities
 * Supports multiple depreciation methods:
 * - STRAIGHT_LINE: Linear depreciation over asset life
 * - DECLINING_BALANCE: Accelerated depreciation (double declining balance)
 */

const DEPRECIATION_METHODS = {
  STRAIGHT_LINE: 'straight_line',
  DECLINING_BALANCE: 'declining_balance'
};

const DEPRECIATION_METHOD_LABELS = {
  straight_line: 'Straight Line Depreciation',
  declining_balance: 'Declining Balance Depreciation'
};

/**
 * Calculate straight-line depreciation
 * Formula: (Cost - Salvage Value) * Rate / 12
 * 
 * @param {Object} params
 * @param {number} params.purchaseCost - Original cost of asset
 * @param {number} params.salvageValue - Residual value after depreciation
 * @param {number} params.annualRate - Annual depreciation rate (0-100)
 * @param {number} params.usefulLife - Useful life in years (optional)
 * @param {string} params.period - 'monthly', 'yearly' (default: 'monthly')
 * @returns {number} Depreciation amount for the period
 */
const calculateStraightLine = (params) => {
  const {
    purchaseCost,
    salvageValue,
    annualRate,
    usefulLife,
    period = 'monthly'
  } = params;

  const cost = parseFloat(purchaseCost) || 0;
  const salvage = parseFloat(salvageValue) || 0;
  const rate = parseFloat(annualRate) || 0;
  const life = parseFloat(usefulLife) || 0;

  if (cost <= 0 || (rate <= 0 && life <= 0)) return 0;

  // If useful life is provided, calculate annual depreciation from it
  // Otherwise use the rate
  let annualDepreciation;

  if (life > 0) {
    annualDepreciation = (cost - salvage) / life;
  } else {
    annualDepreciation = (cost - salvage) * (rate / 100);
  }

  if (period === 'yearly') {
    return annualDepreciation;
  }

  // Monthly depreciation
  return annualDepreciation / 12;
};

/**
 * Calculate declining balance depreciation (accelerated)
 * Formula for Double Declining Balance:
 * Monthly Depreciation = (Book Value * 2 / Useful Life) / 12
 * 
 * @param {Object} params
 * @param {number} params.bookValue - Current book value of asset
 * @param {number} params.usefulLife - Useful life in years
 * @param {number} params.salvageValue - Minimum salvage value (floor)
 * @param {number} params.declineRate - Decline multiplier (default: 2 for double declining)
 * @param {string} params.period - 'monthly', 'yearly' (default: 'monthly')
 * @returns {number} Depreciation amount for the period
 */
const calculateDecliningBalance = (params) => {
  const {
    bookValue,
    usefulLife,
    salvageValue = 0,
    declineRate = 2,
    period = 'monthly'
  } = params;

  const currentValue = parseFloat(bookValue) || 0;
  const salvage = parseFloat(salvageValue) || 0;
  const life = parseFloat(usefulLife) || 1;

  if (currentValue <= salvage || life <= 0) return 0;

  // Calculate the straight-line rate and double it
  const straightLineRate = 1 / life;
  const declinedRate = straightLineRate * declineRate;

  // Calculate depreciation
  let depreciation = currentValue * declinedRate;

  // Ensure we don't go below salvage value
  if (currentValue - depreciation < salvage) {
    depreciation = currentValue - salvage;
  }

  if (period === 'yearly') {
    return depreciation;
  }

  // Monthly depreciation
  return depreciation / 12;
};

/**
 * Calculate depreciation schedule for multiple periods
 * 
 * @param {Object} params
 * @param {number} params.purchaseCost - Original asset cost
 * @param {number} params.salvageValue - Residual value
 * @param {number} params.usefulLife - Life in years
 * @param {number} params.annualRate - Annual depreciation rate
 * @param {string} params.method - Depreciation method
 * @param {Date} params.purchaseDate - Asset purchase date
 * @param {number} params.periods - Number of periods to calculate
 * @param {string} params.periodType - 'month' or 'year'
 * @returns {Array} Array of depreciation schedule items
 */
const getDepreciationSchedule = (params) => {
  const {
    purchaseCost,
    salvageValue,
    usefulLife,
    annualRate,
    method = DEPRECIATION_METHODS.STRAIGHT_LINE,
    purchaseDate,
    periods = 12,
    periodType = 'month'
  } = params;

  const schedule = [];
  let currentBookValue = parseFloat(purchaseCost) || 0;
  let currentDate = new Date(purchaseDate);
  let totalDepreciation = 0;

  for (let i = 0; i < periods; i++) {
    let depreciation = 0;

    if (method === DEPRECIATION_METHODS.STRAIGHT_LINE) {
      depreciation = calculateStraightLine({
        purchaseCost,
        salvageValue,
        annualRate,
        usefulLife,
        period: periodType === 'month' ? 'monthly' : 'yearly'
      });
    } else if (method === DEPRECIATION_METHODS.DECLINING_BALANCE) {
      depreciation = calculateDecliningBalance({
        bookValue: currentBookValue,
        usefulLife,
        salvageValue,
        declineRate: 2,
        period: periodType === 'month' ? 'monthly' : 'yearly'
      });
    }

    // Ensure we don't go below salvage value
    if (currentBookValue - depreciation < salvageValue) {
      depreciation = currentBookValue - salvageValue;
    }

    currentBookValue -= depreciation;
    totalDepreciation += depreciation;

    // Calculate next period date
    if (periodType === 'month') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }

    schedule.push({
      period: i + 1,
      date: new Date(currentDate),
      depreciation: Math.round(depreciation * 100) / 100,
      totalDepreciation: Math.round(totalDepreciation * 100) / 100,
      bookValue: Math.round(currentBookValue * 100) / 100,
      method
    });
  }

  return schedule;
};

/**
 * Validate depreciation parameters
 * 
 * @param {Object} params
 * @returns {Object} { isValid: boolean, errors: Array }
 */
const validateDepreciationParams = (params) => {
  const errors = [];

  if (!params.purchaseCost || parseFloat(params.purchaseCost) <= 0) {
    errors.push('Purchase cost must be greater than 0');
  }

  if (!params.method || !Object.values(DEPRECIATION_METHODS).includes(params.method)) {
    errors.push(`Method must be one of: ${Object.values(DEPRECIATION_METHODS).join(', ')}`);
  }

  if (params.method === DEPRECIATION_METHODS.STRAIGHT_LINE) {
    if (!params.annualRate || parseFloat(params.annualRate) <= 0) {
      errors.push('Annual rate must be greater than 0 for straight-line method');
    }
  }

  if (params.method === DEPRECIATION_METHODS.DECLINING_BALANCE) {
    if (!params.usefulLife || parseFloat(params.usefulLife) <= 0) {
      errors.push('Useful life must be greater than 0 for declining balance method');
    }
  }

  const salvage = parseFloat(params.salvageValue) || 0;
  const cost = parseFloat(params.purchaseCost) || 0;

  if (salvage >= cost) {
    errors.push('Salvage value must be less than purchase cost');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Calculate accumulated depreciation to date
 * 
 * @param {Object} params
 * @returns {number} Total accumulated depreciation
 */
const calculateAccumulatedDepreciation = (params) => {
  const {
    purchaseCost,
    currentValue,
    salvageValue
  } = params;

  const cost = parseFloat(purchaseCost) || 0;
  const current = parseFloat(currentValue) || 0;
  const salvage = parseFloat(salvageValue) || 0;

  return Math.max(0, cost - current);
};

/**
 * Calculate remaining useful life based on current value
 * 
 * @param {Object} params
 * @returns {number} Remaining life in years
 */
const calculateRemainingLife = (params) => {
  const {
    purchaseCost,
    currentValue,
    usefulLife,
    salvageValue
  } = params;

  const cost = parseFloat(purchaseCost) || 0;
  const current = parseFloat(currentValue) || 0;
  const life = parseFloat(usefulLife) || 1;
  const salvage = parseFloat(salvageValue) || 0;

  if (cost <= salvage) return 0;

  const depreciated = cost - current;
  const totalDepreciable = cost - salvage;

  if (totalDepreciable <= 0) return 0;

  const percentDepreciated = depreciated / totalDepreciable;
  const remainingLife = life * (1 - percentDepreciated);

  return Math.max(0, remainingLife);
};

module.exports = {
  DEPRECIATION_METHODS,
  DEPRECIATION_METHOD_LABELS,
  calculateStraightLine,
  calculateDecliningBalance,
  getDepreciationSchedule,
  validateDepreciationParams,
  calculateAccumulatedDepreciation,
  calculateRemainingLife
};
