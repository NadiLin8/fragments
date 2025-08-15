// src/model/data/aws/dynamoDBClient.js

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

/**
 * Configure DynamoDB client with optional endpoint override for local development
 */
const getDynamoDBClient = () => {
  const config = {
    region: process.env.AWS_REGION || 'us-east-1',
  };

  // Use DynamoDB Local endpoint if specified (for development/testing)
  if (process.env.AWS_DYNAMODB_ENDPOINT_URL) {
    config.endpoint = process.env.AWS_DYNAMODB_ENDPOINT_URL;
    logger.debug({ endpoint: config.endpoint }, 'Using DynamoDB Local endpoint');
  }

  // Add credentials if provided (for local development)
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    };
    logger.debug('Using AWS credentials from environment');
  }

  const client = new DynamoDBClient(config);
  return DynamoDBDocumentClient.from(client);
};

module.exports = getDynamoDBClient();
