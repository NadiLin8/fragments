// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // If no id is provided, generate one
    if (!id) {
      this.id = randomUUID();
    } else {
      this.id = id;
    }

    // ownerId and type are required
    if (!ownerId) {
      throw new Error('ownerId is required');
    }
    if (!type) {
      throw new Error('type is required');
    }

    // Make sure the type is supported
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Unsupported type: ${type}`);
    }

    this.ownerId = ownerId;
    this.type = type;
    this.size = size;

    // If no created date is provided, use current date
    if (!created) {
      this.created = new Date().toISOString();
    } else {
      this.created = created;
    }

    // If no updated date is provided, use current date
    if (!updated) {
      this.updated = new Date().toISOString();
    } else {
      this.updated = updated;
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @return {Promise<Array<Fragment|string>>} list of fragments
   */
  static async byUser(ownerId, expand = false) {
    const fragments = await listFragments(ownerId, expand);
    
    if (!expand) {
      return fragments;
    }
    
    // Return full fragment metadata
    const fragmentDetails = await Promise.all(
      fragments.map(async (id) => {
        const fragment = await Fragment.byId(ownerId, id);
        return fragment;
      })
    );
    
    return fragmentDetails;
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @return {Promise<Fragment>} the user's fragment
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error(`Fragment ${id} not found`);
    }
    return new Fragment(fragment);
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @return {Promise} a Promise that fulfills when the fragment is deleted
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @return {Promise} a Promise that fulfills when the fragment is saved
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @return {Promise<Buffer>} a Promise that fulfills with the fragment's data
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data the raw data to save for the fragment
   * @return {Promise} a Promise that fulfills when the fragment's data is saved
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();
    
    await Promise.all([
      writeFragmentData(this.ownerId, this.id, data),
      writeFragment(this)
    ]);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @return {string} the fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @return {boolean} true if fragment is text/* type
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @return {Array<string>} list of supported mime types
   */
  get formats() {
    const conversions = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'text/csv': ['text/csv', 'text/plain', 'application/json'],
      'application/json': ['application/json', 'application/yaml', 'text/plain'],
      'application/yaml': ['application/yaml', 'text/plain']
    };
    
    return conversions[this.mimeType] || [this.mimeType];
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain; charset=utf-8')
   * @return {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // Parse the content type to get just the media type
    const { type } = contentType.parse(value);
    
    // Supported types for Assignment 2
    const supportedTypes = [
      'text/plain',
      'text/markdown', 
      'text/html',
      'text/csv',
      'application/json',
      'application/yaml'
    ];

    // Also support any text/* type
    return supportedTypes.includes(type) || type.startsWith('text/');
  }
}

module.exports.Fragment = Fragment;