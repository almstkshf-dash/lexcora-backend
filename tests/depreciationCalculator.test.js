const assert = require('assert');
const { describe, it } = require('node:test');
const {
  calculateStraightLine,
  calculateDecliningBalance,
  getDepreciationSchedule,
  validateDepreciationParams,
  DEPRECIATION_METHODS
} = require('../src/utils/depreciationCalculator');

describe('Depreciation Calculator', () => {
  it('should calculate straight line monthly depreciation using rate', () => {
    const amount = calculateStraightLine({
      purchaseCost: 1200,
      salvageValue: 0,
      annualRate: 10,
      period: 'monthly'
    });

    assert.strictEqual(Math.round(amount * 100) / 100, 10);
  });

  it('should calculate straight line monthly depreciation using useful life', () => {
    const amount = calculateStraightLine({
      purchaseCost: 1200,
      salvageValue: 200,
      usefulLife: 5,
      period: 'monthly'
    });

    assert.strictEqual(Math.round(amount * 100) / 100, 16.67);
  });

  it('should calculate declining balance monthly depreciation', () => {
    const amount = calculateDecliningBalance({
      bookValue: 1000,
      usefulLife: 5,
      salvageValue: 0,
      period: 'monthly'
    });

    assert.strictEqual(Math.round(amount * 100) / 100, 33.33);
  });

  it('should calculate a depreciation schedule for 12 months', () => {
    const schedule = getDepreciationSchedule({
      purchaseCost: 1200,
      salvageValue: 0,
      usefulLife: 5,
      annualRate: 10,
      method: DEPRECIATION_METHODS.STRAIGHT_LINE,
      purchaseDate: new Date('2026-01-01'),
      periods: 12,
      periodType: 'month'
    });

    assert.strictEqual(schedule.length, 12);
    assert.strictEqual(schedule[0].depreciation, 20);
    assert.strictEqual(schedule[11].bookValue, 960);
  });

  it('should validate depreciation input for declining balance requires useful life', () => {
    const error = validateDepreciationParams({
      purchaseCost: 1000,
      salvageValue: 100,
      method: DEPRECIATION_METHODS.DECLINING_BALANCE,
      annualRate: 10,
      usefulLife: 0
    });

    assert.strictEqual(error.isValid, false);
    assert.strictEqual(error.errors[0], 'Useful life must be greater than 0 for declining balance method');
  });

  it('should validate straight line input requires rate or useful life', () => {
    const error = validateDepreciationParams({
      purchaseCost: 1000,
      salvageValue: 100,
      method: DEPRECIATION_METHODS.STRAIGHT_LINE,
      annualRate: 0,
      usefulLife: 0
    });

    assert.strictEqual(error.isValid, false);
    assert.strictEqual(error.errors[0], 'Annual rate must be greater than 0 for straight-line method');
  });

  it('should reject salvage value equal or higher than purchase cost', () => {
    const error = validateDepreciationParams({
      purchaseCost: 1000,
      salvageValue: 1000,
      method: DEPRECIATION_METHODS.STRAIGHT_LINE,
      annualRate: 10,
      usefulLife: 5
    });

    assert.strictEqual(error.isValid, false);
    assert.strictEqual(error.errors[0], 'Salvage value must be less than purchase cost');
  });
});
