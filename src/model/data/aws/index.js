// src/model/data/aws/index.js

const logger = require('../../../logger');
const s3Client = require('./s3Client');
const dynamoDBClient = require('./dynamoDBClient');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Get table name from environment
const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_NAME || 'fragments';

/**
 * Write a fragment's metadata to DynamoDB
 */
async function writeFragment(fragment) {
  logger.debug({ fragment }, 'writeFragment()');
  
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ownerId: String(fragment.ownerId), // Convert to string
      id: fragment.id,
      created: fragment.created,
      updated: fragment.updated,
      type: fragment.type,
      size: fragment.size,
    },
  };

  try {
    const command = new PutCommand(params);
    await dynamoDBClient.send(command);
    logger.debug({ ownerId: fragment.ownerId, id: fragment.id }, 'Fragment metadata written to DynamoDB');
  } catch (err) {
    logger.error({ err, fragment }, 'Error writing fragment metadata to DynamoDB');
    throw new Error('unable to write fragment metadata');
  }
}

/**
 * Read a fragment's metadata from DynamoDB
 */
async function readFragment(ownerId, id) {
  logger.debug({ ownerId, id }, 'readFragment()');
  
  const params = {
    TableName: TABLE_NAME,
    Key: {
      ownerId: String(ownerId), // Convert to string
      id: id,
    },
  };

  try {
    const command = new GetCommand(params);
    const result = await dynamoDBClient.send(command);
    
    if (!result.Item) {
      logger.debug({ ownerId, id }, 'Fragment not found in DynamoDB');
      return undefined;
    }
    
    logger.debug({ ownerId, id }, 'Fragment metadata read from DynamoDB');
    return result.Item;
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error reading fragment metadata from DynamoDB');
    throw new Error('unable to read fragment metadata');
  }
}

// Convert a stream of data into a Buffer, by collecting
// chunks of data until finished, then assembling them together.
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Writes a fragment's data to an S3 Object in a Bucket
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${String(ownerId)}/${id}`,
    Body: data,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
    logger.debug({ ownerId, id }, 'Fragment data written to S3');
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Reads a fragment's data from S3 and returns (Promise<Buffer>)
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${String(ownerId)}/${id}`,
  };

  const command = new GetObjectCommand(params);

  try {
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// Get a list of fragment ids for a given user from DynamoDB
async function listFragments(ownerId, expand = false) {
  logger.debug({ ownerId, expand }, 'listFragments()');
  
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': String(ownerId), // Convert to string
    },
  };

  try {
    const command = new QueryCommand(params);
    const result = await dynamoDBClient.send(command);
    
    if (!result.Items) {
      return [];
    }

    if (expand) {
      return result.Items;
    }
    
    return result.Items.map(item => item.id);
  } catch (err) {
    logger.error({ err, ownerId }, 'Error listing fragments from DynamoDB');
    throw new Error('unable to list fragments');
  }
}

// Delete a fragment (metadata and data)
async function deleteFragment(ownerId, id) {
  logger.debug({ ownerId, id }, 'deleteFragment()');
  
  // Delete metadata from DynamoDB
  const dynamoParams = {
    TableName: TABLE_NAME,
    Key: {
      ownerId: String(ownerId), // Convert to string
      id: id,
    },
  };

  // Delete data from S3
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${String(ownerId)}/${id}`,
  };

  try {
    // Delete from both DynamoDB and S3
    const dynamoCommand = new DeleteCommand(dynamoParams);
    const s3Command = new DeleteObjectCommand(s3Params);
    
    await Promise.all([
      dynamoDBClient.send(dynamoCommand),
      s3Client.send(s3Command)
    ]);
    
    logger.debug({ ownerId, id }, 'Fragment deleted from both DynamoDB and S3');
  } catch (err) {
    logger.error({ err, ownerId, id }, 'Error deleting fragment');
    throw new Error('unable to delete fragment');
  }
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
