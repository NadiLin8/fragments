const MemoryDB = require('./memory-db');
const logger = require('../../../logger');

// Create database instances
const data = new MemoryDB();
const metadata = new MemoryDB();

/**
 * Write a fragment's metadata to the database
 */
async function writeFragment(fragment) {
  logger.debug({ fragment }, 'writeFragment()');
  const key = `${fragment.ownerId}#${fragment.id}`;
  return metadata.put(key, fragment);
}

/**
 * Read a fragment's metadata from the database
 */
async function readFragment(ownerId, id) {
  logger.debug({ ownerId, id }, 'readFragment()');
  const key = `${ownerId}#${id}`;
  return metadata.get(key);
}

/**
 * Write a fragment's data to the database
 */
async function writeFragmentData(ownerId, id, buffer) {
  logger.debug({ ownerId, id }, 'writeFragmentData()');
  const key = `${ownerId}#${id}`;
  return data.put(key, buffer);
}

/**
 * Read a fragment's data from the database
 */
async function readFragmentData(ownerId, id) {
  logger.debug({ ownerId, id }, 'readFragmentData()');
  const key = `${ownerId}#${id}`;
  return data.get(key);
}

/**
 * Get a list of fragment ids for a given user
 */
async function listFragments(ownerId, expand = false) {
  logger.debug({ ownerId, expand }, 'listFragments()');
  const query = `${ownerId}#`;
  const keys = metadata.query(query);
  
  if (expand) {
    return keys.map(key => metadata.get(key));
  }
  
  return keys.map(key => key.split('#')[1]);
}

/**
 * Delete a fragment (metadata and data)
 */
async function deleteFragment(ownerId, id) {
  logger.debug({ ownerId, id }, 'deleteFragment()');
  const key = `${ownerId}#${id}`;
  metadata.del(key);
  data.del(key);
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
