const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const FragmentConverter = require('../../model/fragment-converter');
const path = require('path');

/**
 * Get a fragment by id, with optional conversion
 */
module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if there's an extension (conversion requested)
    const ext = path.extname(id);
    const fragmentId = ext ? path.basename(id, ext) : id;
    
    const fragment = await Fragment.byId(req.user, fragmentId);
    
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Get the fragment data
    const data = await fragment.getData();
    
    // If no extension, return original data
    if (!ext) {
      res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(data);
    }

    // Check if conversion is supported
    if (!FragmentConverter.isValidConversion(fragment.type, ext)) {
      return res.status(415).json(
        createErrorResponse(415, `Cannot convert ${fragment.type} to ${ext}`)
      );
    }

    // Perform conversion
    const converter = new FragmentConverter();
    const converted = converter.convert(data, fragment.type, ext);
    
    res.setHeader('Content-Type', converted.contentType);
    res.status(200).send(converted.data);
    
  } catch (error) {
    res.status(500).json(createErrorResponse(500, 'Unable to get fragment'));
  }
};