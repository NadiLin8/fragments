const express = require('express');
const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { authenticate } = require('../../auth');

const router = express.Router();

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch (err) {
        return false;
      }
    },
  });

// Get all fragments for authenticated user
router.get('/fragments', authenticate(), require('./get'));

// Create new fragment
router.post('/fragments', authenticate(), rawBody(), require('./post'));

// Get a specific fragment
router.get('/fragments/:id', authenticate(), require('./get-fragment'));

module.exports = router;
