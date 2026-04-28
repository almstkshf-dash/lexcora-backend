const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const servicePath = path.resolve(__dirname, "../src/services/cashManagementService.js");
const dbPath = path.resolve(__dirname, "../src/config/db.js");

const loadServiceWithMockedDb = (queryImpl) => {
  delete require.cache[servicePath];
  delete require.cache[dbPath];
  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: { query: queryImpl }
  };
  return require(servicePath);
};

test("getCashFlow applies branch/date filters and aggregates totals", async () => {
  const calls = [];
  const query = async (sql, params) => {
    calls.push({ sql, params });
    if (calls.length === 1) return [[{ inflows: "100", outflows: "20" }]];
    if (calls.length === 2) return [[{ inflows: "30", outflows: "5" }]];
    return [[{ inflows: "10", outflows: "2" }]];
  };

  const service = loadServiceWithMockedDb(query);
  const result = await service.getCashFlow({
    date_from: "2026-01-01",
    date_to: "2026-01-31",
    branch_id: 2
  });

  assert.equal(result.summary.totalInflows, 140);
  assert.equal(result.summary.totalOutflows, 27);
  assert.equal(result.summary.netCashFlow, 113);

  assert.equal(calls.length, 3);
  assert.match(calls[0].sql, /LEFT JOIN bank_accounts ba/);
  assert.match(calls[1].sql, /LEFT JOIN petty_cash_funds pcf/);
  assert.match(calls[2].sql, /LEFT JOIN employees e/);
  assert.deepEqual(calls[0].params, ["2026-01-01", "2026-01-31", 2]);
  assert.deepEqual(calls[1].params, ["2026-01-01", "2026-01-31", 2]);
  assert.deepEqual(calls[2].params, ["2026-01-01", "2026-01-31", 2]);
});

test("getDailyCashFlow clamps invalid days and includes employee cash + branch filter", async () => {
  const calls = [];
  const query = async (sql, params) => {
    calls.push({ sql, params });
    return [[{ date: "2026-01-01", total_inflow: "0", total_outflow: "0" }]];
  };

  const service = loadServiceWithMockedDb(query);
  await service.getDailyCashFlow({ days: -10, branch_id: 3 });

  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, /employee_cash_transactions/);
  assert.match(calls[0].sql, /flows\.branch_id = \?/);
  assert.deepEqual(calls[0].params, [30, 3]);
});

