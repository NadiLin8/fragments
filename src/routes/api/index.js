const express = require('express');
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

// Create a router that we can use to mount our API
const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Define our API routes

// GET /v1/fragments - get list of fragments for authenticated user
router.get('/fragments', require('./get'));

// GET /v1/fragments/:id - get fragment data by id (with optional conversion)
router.get('/fragments/:id', require('./get-fragment'));

// GET /v1/fragments/:id/info - get fragment metadata by id
router.get('/fragments/:id/info', require('./get-fragment-info'));

// POST /v1/fragments - create a new fragment
router.post('/fragments', rawBody(), require('./post'));

module.exports = router;