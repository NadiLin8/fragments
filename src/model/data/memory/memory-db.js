/**
 * In-Memory Database for Fragments
 */
class MemoryDB {
  constructor() {
    this.db = {};
  }

  /**
   * Gets a value for the given key
   */
  get(key) {
    return this.db[key];
  }

  /**
   * Puts a key/value pair in the database
   */
  put(key, value) {
    this.db[key] = value;
  }

  /**
   * Gets a list of keys from the database
   */
  query(query) {
    return Object.keys(this.db).filter((key) => key.startsWith(query));
  }

  /**
   * Removes a key from the database
   */
  del(key) {
    delete this.db[key];
  }
}

module.exports = MemoryDB;
