// src/routes/api/put.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Update (replace) a fragment for the current user
 */
module.exports = async (req, res) => {
  try {
    // Get the existing fragment
    const fragment = await Fragment.byId(req.user, req.params.id);
    
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Check if the content-type matches the existing fragment's type
    const contentType = req.get('Content-Type');
    if (contentType !== fragment.type) {
      return res.status(400).json(createErrorResponse(400, 'Cannot change fragment type'));
    }

    // Update the fragment data
    await fragment.setData(req.body);
    
    logger.debug({ ownerId: req.user, id: req.params.id }, 'Fragment updated successfully');
    res.status(200).json(createSuccessResponse({ fragment }));
    
  } catch (err) {
    logger.error({ err, ownerId: req.user, id: req.params.id }, 'Error updating fragment');
    res.status(500).json(createErrorResponse(500, 'Unable to update fragment'));
  }
};
