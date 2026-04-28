const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const express = require("express");
const request = require("supertest");

const routePath = path.resolve(__dirname, "../src/routes/bankingRoutes.js");
const authPath = path.resolve(__dirname, "../src/middliewares/authMiddleware.js");
const uploadPath = path.resolve(__dirname, "../src/controllers/uploadController.js");
const controllerPath = path.resolve(__dirname, "../src/controllers/bankController.js");

const buildAppWithRouter = () => {
  let cashFlowCalled = 0;
  let dailyCalled = 0;

  delete require.cache[routePath];
  delete require.cache[authPath];
  delete require.cache[uploadPath];
  delete require.cache[controllerPath];

  require.cache[authPath] = {
    id: authPath,
    filename: authPath,
    loaded: true,
    exports: {
      authenticateToken: (req, res, next) => {
        req.user = { id: 1 };
        next();
      }
    }
  };

  require.cache[uploadPath] = {
    id: uploadPath,
    filename: uploadPath,
    loaded: true,
    exports: {
      upload: {
        single: () => (req, res, next) => next()
      }
    }
  };

  require.cache[controllerPath] = {
    id: controllerPath,
    filename: controllerPath,
    loaded: true,
    exports: {
      importStatement: (req, res) => res.json({ success: true }),
      autoMatch: (req, res) => res.json({ success: true }),
      getUnreconciledLines: (req, res) => res.json({ success: true }),
      reconcileLine: (req, res) => res.json({ success: true }),
      syncAccount: (req, res) => res.json({ success: true }),
      getCashFlowReport: (req, res) => {
        cashFlowCalled += 1;
        res.json({ success: true, data: {} });
      },
      getDailyCashFlow: (req, res) => {
        dailyCalled += 1;
        res.json({ success: true, data: [] });
      }
    }
  };

  const router = require(routePath);
  const app = express();
  app.use(express.json());
  app.use("/api/banking", router);

  return {
    app,
    getCounts: () => ({ cashFlowCalled, dailyCalled })
  };
};

test("banking cash-flow routes reject invalid query params before controller", async () => {
  const { app, getCounts } = buildAppWithRouter();

  const invalidCashFlow = await request(app)
    .get("/api/banking/cash-flow")
    .query({ date_from: "invalid-date", branch_id: "abc" });

  assert.equal(invalidCashFlow.status, 400);
  assert.equal(invalidCashFlow.body.success, false);
  assert.equal(getCounts().cashFlowCalled, 0);

  const invalidDaily = await request(app)
    .get("/api/banking/cash-flow/daily")
    .query({ days: "9999", branch_id: "x" });

  assert.equal(invalidDaily.status, 400);
  assert.equal(invalidDaily.body.success, false);
  assert.equal(getCounts().dailyCalled, 0);

  const validDaily = await request(app)
    .get("/api/banking/cash-flow/daily")
    .query({ days: "30", branch_id: "2" });

  assert.equal(validDaily.status, 200);
  assert.equal(validDaily.body.success, true);
  assert.equal(getCounts().dailyCalled, 1);
});

