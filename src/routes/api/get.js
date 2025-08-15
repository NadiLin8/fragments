const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    
    if (expand) {
      const fragments = await Fragment.byUser(req.user, true);
      res.status(200).json(createSuccessResponse({ fragments }));
    } else {
      const fragmentIds = await Fragment.byUser(req.user, false);
      res.status(200).json(createSuccessResponse({ fragments: fragmentIds }));
    }
  } catch {
    res.status(500).json(createErrorResponse(500, 'Unable to get fragments'));
  }
};
