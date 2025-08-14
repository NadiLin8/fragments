const { Fragment } = require('../../src/model/fragment');

describe('Fragment', () => {
  describe('Fragment(options)', () => {
    test('should create fragment with all properties', () => {
      const fragment = new Fragment({
        id: 'test-id',
        ownerId: 'user123',
        type: 'text/plain',
        size: 100,
        created: '2021-01-01T00:00:00.000Z',
        updated: '2021-01-01T00:00:00.000Z'
      });
      expect(fragment.id).toBe('test-id');
      expect(fragment.ownerId).toBe('user123');
      expect(fragment.type).toBe('text/plain');
      expect(fragment.size).toBe(100);
    });

    test('should create fragment with generated id if not provided', () => {
      const fragment = new Fragment({
        ownerId: 'user123',
        type: 'text/plain'
      });
      expect(fragment.id).toBeDefined();
      expect(fragment.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    test('should throw error if ownerId missing', () => {
      expect(() => new Fragment({ type: 'text/plain' })).toThrow('ownerId is required');
    });

    test('should throw error if type missing', () => {
      expect(() => new Fragment({ ownerId: 'user123' })).toThrow('type is required');
    });

    test('should throw error for unsupported type', () => {
      expect(() => new Fragment({
        ownerId: 'user123',
        type: 'image/png'
      })).toThrow('Unsupported type: image/png');
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

    test('should return false for unsupported types', () => {
      expect(Fragment.isSupportedType('image/png')).toBe(false);
      expect(Fragment.isSupportedType('video/mp4')).toBe(false);
    });
  });

  describe('save() and getData()', () => {
    test('should save and retrieve fragment data', async () => {
      const fragment = new Fragment({
        ownerId: 'user123',
        type: 'text/plain'
      });
      
      const data = Buffer.from('Hello, World!');
      await fragment.setData(data);
      
      const retrievedData = await fragment.getData();
      expect(retrievedData).toEqual(data);
      expect(fragment.size).toBe(data.length);
    });
  });
});
