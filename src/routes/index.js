const { createSuccessResponse } = require('../response');
const express = require('express');
// version and author from package.json
const { version, author } = require('../../package.json');
// Our authentication middleware
const { authenticate } = require('../auth');

// Create a router that we can use to mount our API
const router = express.Router();

/**
 * Expose all of our API routes on /v1/* to include an API version.
 * Protect them all with middleware so you have to be authenticated
 * in order to access things.
 */
router.use(`/v1`, authenticate(), require('./api'));

/**
 * Define a simple health check route. If the server is running
 * we'll respond with a 200 OK.  If not, the server isn't healthy.
 */
router.get('/', (req, res) => {
  // Client's shouldn't cache this response (always request it fresh)
  res.setHeader('Cache-Control', 'no-cache');
  
  // Send a 200 'OK' response
  res.status(200).json(createSuccessResponse({
    author,
    githubUrl: 'https://github.com/NadiLin8/fragments',  // ← Add this line
    version
  }));
});

module.exports = router;