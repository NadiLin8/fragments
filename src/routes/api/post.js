const contentType = require('content-type');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

async function createFragment(req, res) {
  try {
    const ownerId = req.user.id;
    
    // Check Content-Type header first
    const contentTypeHeader = req.get('Content-Type');
    if (!contentTypeHeader) {
      return res.status(400).json(createErrorResponse(400, 'Content-Type header is required'));
    }
    
    let type;
    try {
      ({ type } = contentType.parse(contentTypeHeader));
    } catch (err) {
      return res.status(400).json(createErrorResponse(400, 'Invalid Content-Type header'));
    }
    
    if (!Fragment.isSupportedType(type)) {
      logger.warn({ type }, 'Attempted to create fragment with unsupported type');
      return res.status(415).json(createErrorResponse(415, `Unsupported Media Type: ${type}`));
    }
    
    if (!Buffer.isBuffer(req.body)) {
      return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
    }
    
    logger.info({ ownerId, type, size: req.body.length }, 'Creating new fragment');
    
    const fragment = new Fragment({
      ownerId,
      type: contentTypeHeader,
      size: req.body.length
    });
    
    await fragment.save();
    await fragment.setData(req.body);
    
    logger.info({ fragmentId: fragment.id }, 'Fragment created successfully');
    
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const location = `${baseUrl}/v1/fragments/${fragment.id}`;
    
    res.status(201)
       .location(location)
       .json(createSuccessResponse({
         fragment: {
           id: fragment.id,
           ownerId: fragment.ownerId,
           created: fragment.created,
           updated: fragment.updated,
           type: fragment.type,
           size: fragment.size
         }
       }));
  } catch (error) {
    logger.error({ error: error.message }, 'Error creating fragment');
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
}

module.exports = createFragment;
