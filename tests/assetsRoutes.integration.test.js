const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('express');
const request = require('supertest');

const routePath = path.resolve(__dirname, '../src/routes/assetsRoute.js');
const authPath = path.resolve(__dirname, '../src/middliewares/authMiddleware.js');
const controllerPath = path.resolve(__dirname, '../src/controllers/assetsController.js');

const buildAppWithRouter = () => {
  delete require.cache[routePath];
  delete require.cache[authPath];
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

  require.cache[controllerPath] = {
    id: controllerPath,
    filename: controllerPath,
    loaded: true,
    exports: {
      getAssets: (req, res) => res.json({ success: true, route: 'getAssets' }),
      getAsset: (req, res) => res.json({ success: true, route: 'getAsset', id: req.params.id }),
      getAssetDocuments: (req, res) => res.json({ success: true, route: 'getAssetDocuments' }),
      createAsset: (req, res) => res.status(201).json({ success: true, route: 'createAsset' }),
      disposeAsset: (req, res) => res.json({ success: true, route: 'disposeAsset' }),
      transferAsset: (req, res) => res.json({ success: true, route: 'transferAsset', body: req.body }),
      getAssetTransfers: (req, res) => res.json({ success: true, route: 'getAssetTransfers', id: req.params.id }),
      revalueAsset: (req, res) => res.json({ success: true, route: 'revalueAsset', body: req.body }),
      getAssetRevaluations: (req, res) => res.json({ success: true, route: 'getAssetRevaluations', id: req.params.id }),
      getDepreciationSchedule: (req, res) => res.json({ success: true, route: 'getDepreciationSchedule', id: req.params.id }),
      getCurrentMonthDepreciation: (req, res) => res.json({ success: true, route: 'getCurrentMonthDepreciation', id: req.params.id }),
      updateDepreciationSettings: (req, res) => res.json({ success: true, route: 'updateDepreciationSettings', body: req.body }),
      getDepreciationPreview: (req, res) => res.json({ success: true, route: 'getDepreciationPreview', body: req.body }),
      updateAsset: (req, res) => res.json({ success: true, route: 'updateAsset' }),
      deleteAsset: (req, res) => res.json({ success: true, route: 'deleteAsset' }),
      deleteAssetDocument: (req, res) => res.json({ success: true, route: 'deleteAssetDocument' }),
      getDepreciationMethods: (req, res) => res.json({ success: true, route: 'getDepreciationMethods', data: [] })
    }
  };

  const router = require(routePath);
  const app = express();
  app.use(express.json());
  app.use('/api/assets', router);
  return app;
};

test('assets route wiring includes transfer and revaluation endpoints', async () => {
  const app = buildAppWithRouter();

  const transferResponse = await request(app)
    .post('/api/assets/123/transfer')
    .send({ to_branch_id: 2, to_custodian_id: 5, reason: 'Move to new location' });

  assert.equal(transferResponse.status, 200);
  assert.equal(transferResponse.body.success, true);
  assert.equal(transferResponse.body.route, 'transferAsset');
  assert.equal(transferResponse.body.body.to_branch_id, 2);
  assert.equal(transferResponse.body.body.reason, 'Move to new location');

  const transfersResponse = await request(app).get('/api/assets/123/transfers');
  assert.equal(transfersResponse.status, 200);
  assert.equal(transfersResponse.body.success, true);
  assert.equal(transfersResponse.body.route, 'getAssetTransfers');
  assert.equal(transfersResponse.body.id, '123');

  const revalueResponse = await request(app)
    .post('/api/assets/123/revalue')
    .send({ new_value: 5000, reason: 'Market revaluation' });

  assert.equal(revalueResponse.status, 200);
  assert.equal(revalueResponse.body.success, true);
  assert.equal(revalueResponse.body.route, 'revalueAsset');
  assert.equal(revalueResponse.body.body.new_value, 5000);

  const revaluationsResponse = await request(app).get('/api/assets/123/revaluations');
  assert.equal(revaluationsResponse.status, 200);
  assert.equal(revaluationsResponse.body.success, true);
  assert.equal(revaluationsResponse.body.route, 'getAssetRevaluations');
  assert.equal(revaluationsResponse.body.id, '123');
});
