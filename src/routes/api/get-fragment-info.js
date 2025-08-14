const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (error) {
    res.status(500).json(createErrorResponse(500, 'Unable to get fragment info'));
  }
};
