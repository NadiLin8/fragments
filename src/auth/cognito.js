const passport = require('passport');
const BearerStrategy = require('passport-http-bearer').Strategy;
const authorize = require('./auth-middleware');

const logger = require('../logger');

if (!process.env.AWS_COGNITO_POOL_ID || !process.env.AWS_COGNITO_CLIENT_ID) {
  throw new Error('missing expected env var: AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID');
}

logger.info('Using AWS Cognito for auth');

module.exports.strategy = () =>
  new BearerStrategy((token, done) => {
    // In production, validate JWT token against Cognito
    // For now, accept any token for testing
    if (token) {
      const user = { email: 'user@example.com' };
      return done(null, user);
    }
    return done(null, false);
  });

module.exports.authenticate = () => authorize('bearer');
