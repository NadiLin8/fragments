const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

async function getFragments(req, res) {
  try {
    const ownerId = req.user.id;
    const expand = req.query.expand === '1';
    
    logger.debug({ ownerId, expand }, 'Getting fragments for user');
    
    const fragments = await Fragment.byUser(ownerId, expand);
    
    res.json(createSuccessResponse({ fragments }));
  } catch (error) {
    logger.error({ error: error.message }, 'Error getting fragments');
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
}

module.exports = getFragments;
