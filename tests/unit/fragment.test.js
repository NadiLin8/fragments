const { Fragment } = require('../../src/model/fragment');

describe('Fragment', () => {
  describe('Fragment(options)', () => {
    test('should create fragment with all properties', () => {
      const fragment = new Fragment({
        id: 'test-id',
        ownerId: 'user123',
        created: '2021-11-02T15:09:50.403Z',
        updated: '2021-11-02T15:09:50.403Z',
        type: 'text/plain',
        size: 256,
      });

      expect(fragment.id).toBe('test-id');
      expect(fragment.ownerId).toBe('user123');
      expect(fragment.created).toBe('2021-11-02T15:09:50.403Z');
      expect(fragment.updated).toBe('2021-11-02T15:09:50.403Z');
      expect(fragment.type).toBe('text/plain');
      expect(fragment.size).toBe(256);
    });

    test('should create fragment with generated id if not provided', () => {
      const fragment = new Fragment({
        ownerId: 'user123',
        type: 'text/plain',
      });

      expect(fragment.id).toBeDefined();
      expect(fragment.ownerId).toBe('user123');
      expect(fragment.type).toBe('text/plain');
    });

    test('should throw error if ownerId missing', () => {
      expect(() => new Fragment({
        type: 'text/plain',
      })).toThrow('ownerId is required');
    });

    test('should throw error if type missing', () => {
      expect(() => new Fragment({
        ownerId: 'user123',
      })).toThrow('type is required');
    });

    test('should throw error for unsupported type', () => {
      expect(() => new Fragment({
        ownerId: 'user123',
        type: 'video/mp4'
      })).toThrow('Unsupported type: video/mp4');
    });
  });

  describe('isSupportedType()', () => {
    test('should return true for text/plain', () => {
      expect(Fragment.isSupportedType('text/plain')).toBe(true);
    });

    test('should return true for application/json', () => {
      expect(Fragment.isSupportedType('application/json')).toBe(true);
    });

    test('should return true for text/markdown', () => {
      expect(Fragment.isSupportedType('text/markdown')).toBe(true);
    });

    test('should return true for image types', () => {
      expect(Fragment.isSupportedType('image/png')).toBe(true);
      expect(Fragment.isSupportedType('image/jpeg')).toBe(true);
    });

    test('should return false for unsupported types', () => {
      expect(Fragment.isSupportedType('video/mp4')).toBe(false);
      expect(Fragment.isSupportedType('audio/mp3')).toBe(false);
    });
  });

  describe('save() and getData()', () => {
    test('should save and retrieve fragment data', async () => {
      const fragment = new Fragment({
        ownerId: 'user123',
        type: 'text/plain',
      });

      await fragment.setData(Buffer.from('test data'));
      const data = await fragment.getData();
      
      expect(data.toString()).toBe('test data');
      expect(fragment.size).toBe(9);
    });
  });
describe('Fragment.byUser()', () => {
    test('should return user fragments with expand=true', async () => {
      const fragment = new Fragment({
        ownerId: 'user123',
        type: 'text/plain',
      });
      await fragment.save();

      const fragments = await Fragment.byUser('user123', true);
      expect(Array.isArray(fragments)).toBe(true);
    });

    test('should return user fragments with expand=false', async () => {
      const fragment = new Fragment({
        ownerId: 'user456',
        type: 'text/plain',
      });
      await fragment.save();

      const fragments = await Fragment.byUser('user456', false);
      expect(Array.isArray(fragments)).toBe(true);
    });
  });

  describe('Fragment.byId()', () => {
    test('should find fragment by id', async () => {
      const original = new Fragment({
        ownerId: 'user789',
        type: 'text/plain',
      });
      await original.save();

      const found = await Fragment.byId('user789', original.id);
      expect(found.id).toBe(original.id);
      expect(found.ownerId).toBe('user789');
    });

    test('should return undefined for non-existent fragment', async () => {
      const found = await Fragment.byId('user999', 'non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('Fragment delete operations', () => {
    test('should delete fragment', async () => {
      const fragment = new Fragment({
        ownerId: 'user-delete',
        type: 'text/plain',
      });
      await fragment.save();

      await fragment.delete();
      
      // After deletion, byId should return undefined
      const found = await Fragment.byId('user-delete', fragment.id);
      expect(found).toBeUndefined();
    });
  });

  describe('Fragment data operations edge cases', () => {
    test('should handle setData with string conversion to buffer', async () => {
      const fragment = new Fragment({
        ownerId: 'user-data',
        type: 'text/plain',
      });

      const testData = 'test data content';
      await fragment.setData(Buffer.from(testData));
      
      expect(fragment.size).toBe(Buffer.byteLength(testData));
      
      const retrievedData = await fragment.getData();
      expect(retrievedData.toString()).toBe(testData);
    });

    test('should throw error for non-Buffer data', async () => {
      const fragment = new Fragment({
        ownerId: 'user-error',
        type: 'text/plain',
      });

      await expect(fragment.setData('string data')).rejects.toThrow('data must be a Buffer');
    });

    test('should handle empty data correctly', async () => {
      const fragment = new Fragment({
        ownerId: 'user-empty',
        type: 'text/plain',
      });

      await fragment.setData(Buffer.from(''));
      expect(fragment.size).toBe(0);
      
      const data = await fragment.getData();
      expect(data.toString()).toBe('');
    });

    test('should update fragment timestamp when data is set', async () => {
      const fragment = new Fragment({
        ownerId: 'user-timestamp',
        type: 'text/plain',
      });

      const originalUpdated = fragment.updated;
      
      // Wait a tiny bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1));
      
      await fragment.setData(Buffer.from('new data'));
      
      expect(fragment.updated).not.toBe(originalUpdated);
    });
  });

  describe('Fragment properties and getters', () => {
    test('should return correct mimeType', () => {
      const fragment = new Fragment({
        ownerId: 'user-mime',
        type: 'text/plain; charset=utf-8',
      });

      expect(fragment.mimeType).toBe('text/plain');
    });

    test('should identify text fragments correctly', () => {
      const fragment = new Fragment({
        ownerId: 'user-text',
        type: 'text/plain',
      });

      expect(fragment.isText).toBe(true);
    });

    test('should identify non-text fragments correctly', () => {
      const fragment = new Fragment({
        ownerId: 'user-image',
        type: 'image/png',
      });

      expect(fragment.isText).toBe(false);
    });

    test('should return correct formats for text/plain', () => {
      const fragment = new Fragment({
        ownerId: 'user-formats',
        type: 'text/plain',
      });

      const formats = fragment.formats;
      expect(formats).toContain('text/plain');
      expect(formats.length).toBe(1);
    });

    test('should return correct formats for text/markdown', () => {
      const fragment = new Fragment({
        ownerId: 'user-md',
        type: 'text/markdown',
      });

      const formats = fragment.formats;
      expect(formats).toContain('text/markdown');
      expect(formats).toContain('text/html');
      expect(formats).toContain('text/plain');
      expect(formats.length).toBe(3);
    });

    test('should return correct formats for text/html', () => {
      const fragment = new Fragment({
        ownerId: 'user-html',
        type: 'text/html',
      });

      const formats = fragment.formats;
      expect(formats).toContain('text/html');
      expect(formats).toContain('text/plain');
      expect(formats.length).toBe(2);
    });

    test('should return correct formats for application/json', () => {
      const fragment = new Fragment({
        ownerId: 'user-json',
        type: 'application/json',
      });

      const formats = fragment.formats;
      expect(formats).toContain('application/json');
      expect(formats).toContain('text/plain');
      expect(formats.length).toBe(2);
    });

    test('should return correct formats for images', () => {
      const fragment = new Fragment({
        ownerId: 'user-img',
        type: 'image/png',
      });

      const formats = fragment.formats;
      expect(formats).toContain('image/png');
      expect(formats).toContain('image/jpeg');
      expect(formats).toContain('image/webp');
      expect(formats).toContain('image/gif');
      expect(formats.length).toBe(4);
    });
  });

  describe('Fragment validation edge cases', () => {
    test('should throw error for negative size', () => {
      expect(() => new Fragment({
        ownerId: 'user-negative',
        type: 'text/plain',
        size: -1
      })).toThrow('size must be a non-negative number');
    });

    test('should throw error for non-number size', () => {
      expect(() => new Fragment({
        ownerId: 'user-string-size',
        type: 'text/plain',
        size: 'invalid'
      })).toThrow('size must be a non-negative number');
    });

    test('should handle charset in supported type check', () => {
      expect(Fragment.isSupportedType('text/plain; charset=utf-8')).toBe(true);
    });

    test('should handle malformed content type gracefully', () => {
      expect(Fragment.isSupportedType('invalid-type')).toBe(false);
    });

    test('should handle empty string ownerId', () => {
      expect(() => {
        new Fragment({ ownerId: '', type: 'text/plain' });
      }).toThrow('ownerId is required');
    });

    test('should handle null type', () => {
      expect(() => {
        new Fragment({ ownerId: 'user@test.com', type: null });
      }).toThrow('type is required');
    });

    test('should handle undefined size (defaults to 0)', () => {
      const fragment = new Fragment({ 
        ownerId: 'user@test.com', 
        type: 'text/plain' 
      });
      expect(fragment.size).toBe(0);
    });

    test('should handle various image types in isSupportedType', () => {
      expect(Fragment.isSupportedType('image/png')).toBe(true);
      expect(Fragment.isSupportedType('image/jpeg')).toBe(true);
      expect(Fragment.isSupportedType('image/webp')).toBe(true);
      expect(Fragment.isSupportedType('image/gif')).toBe(true);
    });

    test('should reject completely unsupported types', () => {
      expect(Fragment.isSupportedType('video/mp4')).toBe(false);
      expect(Fragment.isSupportedType('audio/mp3')).toBe(false);
      expect(Fragment.isSupportedType('application/pdf')).toBe(false);
    });
  });
});
