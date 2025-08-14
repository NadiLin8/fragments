const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const FragmentConverter = require('../../model/fragment-converter');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ext = path.extname(id);
    const fragmentId = ext ? path.basename(id, ext) : id;
    
    const fragment = await Fragment.byId(req.user, fragmentId);
    const data = await fragment.getData();
    
    if (!ext) {
      res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(data);
    }

    if (FragmentConverter.isValidConversion(fragment.type, ext)) {
      const converter = new FragmentConverter();
      const converted = converter.convert(data, fragment.type, ext);
      res.setHeader('Content-Type', converted.contentType);
      return res.status(200).send(converted.data);
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(data);
    
  } catch (error) {
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};