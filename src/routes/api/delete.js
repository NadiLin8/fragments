// src/routes/api/delete.js

const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

/**
 * Delete a fragment for the current user
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Use the instance delete method, not static
    await fragment.delete();
    
    logger.debug({ ownerId: req.user, id: req.params.id }, 'Fragment deleted successfully');
    res.status(200).json(createSuccessResponse());
    
  } catch (err) {
    logger.error({ err, ownerId: req.user, id: req.params.id }, 'Error deleting fragment');
    res.status(500).json(createErrorResponse(500, 'Unable to delete fragment'));
  }
};
