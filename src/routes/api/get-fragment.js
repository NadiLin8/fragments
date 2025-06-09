const { createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

async function getFragment(req, res) {
  try {
    const { id } = req.params;
    const ownerId = req.user.id;
    
    logger.debug({ ownerId, id }, 'Getting fragment');
    
    const fragment = await Fragment.byId(ownerId, id);
    const data = await fragment.getData();
    
    res.type(fragment.type);
    res.send(data);
  } catch (error) {
    if (error.message === 'Fragment not found') {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    logger.error({ error: error.message }, 'Error getting fragment');
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
}

module.exports = getFragment;
