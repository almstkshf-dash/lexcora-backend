const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const controllerPath = path.resolve(__dirname, "../src/controllers/bankController.js");
const servicePath = path.resolve(__dirname, "../src/services/cashManagementService.js");

const loadControllerWithMockedCashService = (serviceMock) => {
  delete require.cache[controllerPath];
  delete require.cache[servicePath];
  require.cache[servicePath] = {
    id: servicePath,
    filename: servicePath,
    loaded: true,
    exports: serviceMock
  };
  return require(controllerPath);
};

test("getDailyCashFlow validates days and forwards branch filter", async () => {
  let receivedFilters = null;
  const controller = loadControllerWithMockedCashService({
    getCashFlow: async () => ({}),
    getDailyCashFlow: async (filters) => {
      receivedFilters = filters;
      return [{ date: "2026-01-01", total_inflow: 10, total_outflow: 5 }];
    }
  });

  const req = { query: { days: "abc", branch_id: "2" } };
  const res = {
    payload: null,
    json(payload) {
      this.payload = payload;
      return this;
    },
    status() {
      return this;
    }
  };

  await controller.getDailyCashFlow(req, res);
  assert.deepEqual(receivedFilters, { days: 30, branch_id: "2" });
  assert.equal(res.payload.success, true);
});

