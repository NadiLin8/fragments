const passport = require('passport');
const { hashEmail } = require('../hash');
const logger = require('../logger');

function authorize(strategy) {
  return (req, res, next) => {
    passport.authenticate(strategy, { session: false }, (err, user) => {
      if (err) {
        logger.error({ err }, 'Authentication error');
        return next(err);
      }
      
      if (!user) {
        const error = new Error('Unauthorized');
        error.status = 401;
        return next(error);
      }
      
      // For http-auth-passport, user is just the username string
      const email = typeof user === 'string' ? user : (user.email || user.id || user.username);
      
      req.user = {
        id: hashEmail(email)
      };
      
      logger.debug({ userId: req.user.id }, 'User authenticated');
      next();
    })(req, res, next);
  };
}

module.exports = authorize;
