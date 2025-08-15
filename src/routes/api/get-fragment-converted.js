// src/routes/api/get-fragment-converted.js

const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');
const sharp = require('sharp');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

/**
 * Get a fragment by id with optional format conversion
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    const requestedExt = req.params.ext;
    const data = await fragment.getData();
    
    // If no extension requested, return original
    if (!requestedExt) {
      res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(data);
    }

    // Convert based on current type and requested extension
    let convertedData;
    let newContentType;

    try {
      const result = await convertFragment(data, fragment.type, requestedExt);
      convertedData = result.data;
      newContentType = result.contentType;
    } catch {
      return res.status(415).json(createErrorResponse(415, 'Unsupported conversion'));
    }

    res.setHeader('Content-Type', newContentType);
    res.status(200).send(convertedData);
    
  } catch (err) {
    logger.error({ err, id: req.params.id }, 'Error getting fragment');
    res.status(500).json(createErrorResponse(500, 'Unable to get fragment'));
  }
};

/**
 * Convert fragment data from one format to another
 */
async function convertFragment(data, fromType, toExt) {
  // Text conversions
  if (fromType === 'text/markdown' && toExt === 'html') {
    return {
      data: md.render(data.toString()),
      contentType: 'text/html'
    };
  }
  
  if (fromType === 'text/html' && toExt === 'txt') {
    // Simple HTML to text conversion (strip tags)
    const text = data.toString().replace(/<[^>]*>/g, '');
    return {
      data: text,
      contentType: 'text/plain'
    };
  }

  if (fromType === 'text/plain' && toExt === 'txt') {
    return {
      data: data,
      contentType: 'text/plain'
    };
  }

  // JSON to text conversion
  if (fromType === 'application/json' && toExt === 'txt') {
    return {
      data: data,
      contentType: 'text/plain'
    };
  }

  // Image conversions using Sharp
  if (fromType.startsWith('image/')) {
    return await convertImage(data, toExt);
  }

  throw new Error('Unsupported conversion');
}

/**
 * Convert image using Sharp
 */
async function convertImage(data, toExt) {
  let sharpImage = sharp(data);
  let contentType;

  switch (toExt) {
    case 'png':
      sharpImage = sharpImage.png();
      contentType = 'image/png';
      break;
    case 'jpg':
    case 'jpeg':
      sharpImage = sharpImage.jpeg();
      contentType = 'image/jpeg';
      break;
    case 'webp':
      sharpImage = sharpImage.webp();
      contentType = 'image/webp';
      break;
    case 'gif':
      sharpImage = sharpImage.gif();
      contentType = 'image/gif';
      break;
    default:
      throw new Error('Unsupported image format');
  }

  const convertedData = await sharpImage.toBuffer();
  
  return {
    data: convertedData,
    contentType: contentType
  };
}
