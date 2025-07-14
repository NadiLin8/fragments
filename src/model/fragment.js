const { randomUUID } = require('crypto');
const contentType = require('content-type');
const logger = require('../logger');

const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('ownerId is required');
    }
    if (!type) {
      throw new Error('type is required');
    }
    if (typeof size !== 'number' || size < 0) {
      throw new Error('size must be a non-negative number');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Unsupported type: ${type}`);
    }

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;

    logger.debug({ fragment: this }, 'Fragment created');
  }

  static async byUser(ownerId, expand = false) {
    logger.debug({ ownerId, expand }, 'Fragment.byUser()');
    return listFragments(ownerId, expand);
  }

  static async byId(ownerId, id) {
    logger.debug({ ownerId, id }, 'Fragment.byId()');
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error(`Fragment not found`);
    }
    return new Fragment(fragment);
  }

  async delete() {
    logger.debug({ id: this.id, ownerId: this.ownerId }, 'Fragment.delete()');
    return deleteFragment(this.ownerId, this.id);
  }

  async save() {
    this.updated = new Date().toISOString();
    logger.debug({ fragment: this }, 'Fragment.save()');
    return writeFragment(this);
  }

  async getData() {
    logger.debug({ id: this.id, ownerId: this.ownerId }, 'Fragment.getData()');
    return readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }
    
    this.size = data.length;
    this.updated = new Date().toISOString();
    
    logger.debug({ id: this.id, ownerId: this.ownerId, size: this.size }, 'Fragment.setData()');
    
    await writeFragmentData(this.ownerId, this.id, data);
    await this.save();
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    if (this.mimeType === 'text/plain') {
      return ['text/plain'];
    }
    return [];
  }

  static isSupportedType(value) {
    const supportedTypes = [
      'text/plain',
      'text/plain; charset=utf-8',
      'text/markdown',
      'text/html',
      'application/json'
    ];
  
   try {
      const { type } = contentType.parse(value);
      return supportedTypes.includes(type) || supportedTypes.includes(value);
   } catch (error) {
      return false;
   }
 }
}

module.exports = Fragment;
