const crypto = require('crypto');

/**
 * Hash email address for data privacy
 * @param {string} email - User's email address
 * @returns {string} - Hashed email
 */
function hashEmail(email) {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

module.exports = { hashEmail };
