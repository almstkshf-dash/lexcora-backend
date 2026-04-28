const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('express');
const request = require('supertest');

const routePath = path.resolve(__dirname, '../src/routes/uploadRoute.js');
const authPath = path.resolve(__dirname, '../src/middliewares/authMiddleware.js');
const uploadPath = path.resolve(__dirname, '../src/controllers/uploadController.js');
const blobStoragePath = path.resolve(__dirname, '../src/utils/blobStorage.js');

const buildAppWithRouter = () => {
  let fakeFiles = [];
  const deletedKeys = [];
  const deletedBatch = [];
  const uploadedPaths = [];

  delete require.cache[authPath];
  delete require.cache[uploadPath];
  delete require.cache[blobStoragePath];
  delete require.cache[routePath];

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

  require.cache[blobStoragePath] = {
    id: blobStoragePath,
    filename: blobStoragePath,
    loaded: true,
    exports: {
      uploadToBlob: async (blobPath, buffer, contentType) => {
        uploadedPaths.push(blobPath);
        return {
          url: `https://test.blob.vercel-storage.com/${blobPath}`
        };
      },
      deleteFromBlob: async (url) => {
        deletedKeys.push(url);
      },
      deleteMultipleFromBlob: async (urls) => {
        deletedBatch.push(...urls);
      }
    }
  };

  const uploadControllerModule = require(uploadPath);

  require.cache[uploadPath] = {
    id: uploadPath,
    filename: uploadPath,
    loaded: true,
    exports: {
      ...uploadControllerModule,
      upload: {
        array: () => (req, res, next) => {
          req.files = fakeFiles;
          next();
        }
      }
    }
  };

  const router = require(routePath);
  const app = express();
  app.use(express.json());
  app.use('/api/upload', router);

  return {
    app,
    setFiles: (files) => {
      fakeFiles = files;
    },
    deletedKeys,
    deletedBatch,
    uploadedPaths
  };
};

test('upload route uploads files via Vercel Blob and returns metadata', async () => {
  const { app, setFiles, uploadedPaths } = buildAppWithRouter();

  setFiles([
    {
      originalname: 'test-document.pdf',
      buffer: Buffer.from('%PDF-1.4'),
      mimetype: 'application/pdf',
      size: 1024
    }
  ]);

  const response = await request(app)
    .post('/api/upload')
    .send({ folder: 'case-documents' });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(Array.isArray(response.body.files), true);
  assert.equal(response.body.files.length, 1);
  assert.equal(response.body.files[0].document_name, 'test-document.pdf');
  assert.equal(response.body.files[0].uploaded_by, 1);
  assert.match(response.body.files[0].document_url, /^https:\/\/test\.blob\.vercel-storage\.com\//);
  assert.equal(uploadedPaths.length, 1);
});

test('upload route returns 400 when no files provided', async () => {
  const { app } = buildAppWithRouter();

  const response = await request(app)
    .post('/api/upload')
    .send({ folder: 'case-documents' });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error, 'No files provided');
});

test('delete route normalizes full Vercel Blob URL before deleting', async () => {
  const { app, deletedKeys } = buildAppWithRouter();
  const fullUrl = 'https://store.blob.vercel-storage.com/case-documents/test-document.pdf';

  const response = await request(app)
    .delete('/api/upload')
    .send({ key: fullUrl });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.deepEqual(deletedKeys, ['case-documents/test-document.pdf']);
});

test('delete multiple files route forwards normalized keys', async () => {
  const { app, deletedBatch } = buildAppWithRouter();
  const fullUrls = [
    'https://store.blob.vercel-storage.com/case-documents/file1.pdf',
    'https://store.blob.vercel-storage.com/case-documents/file2.pdf'
  ];

  const response = await request(app)
    .delete('/api/upload/batch')
    .send({ keys: fullUrls });

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.deepEqual(deletedBatch, ['case-documents/file1.pdf', 'case-documents/file2.pdf']);
});
