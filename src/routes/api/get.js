const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    // Check if expand query parameter is set
    const expand = req.query.expand === '1';
    
    if (expand) {
      // Return full fragment metadata
      const fragments = await Fragment.byUser(req.user);
      res.status(200).json(createSuccessResponse({ fragments }));
    } else {
      // Return only fragment IDs (existing behavior)
      const fragmentIds = await Fragment.byUser(req.user, true);
      res.status(200).json(createSuccessResponse({ fragments: fragmentIds }));
    }
  } catch (error) {
    res.status(500).json(createErrorResponse(500, 'Unable to get fragments'));
  }
};