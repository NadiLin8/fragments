const MemoryDB = require('../../src/model/data/memory/memory-db');

describe('MemoryDB', () => {
  let db;

  beforeEach(() => {
    db = new MemoryDB();
  });

  test('put() and get() should work', () => {
    db.put('key', 'value');
    expect(db.get('key')).toBe('value');
  });

  test('get() should return undefined for missing key', () => {
    expect(db.get('missing')).toBeUndefined();
  });

  test('query() should return matching keys', () => {
    db.put('user1#fragment1', 'data1');
    db.put('user1#fragment2', 'data2');
    db.put('user2#fragment1', 'data3');
    
    const results = db.query('user1#');
    expect(results).toHaveLength(2);
    expect(results).toContain('user1#fragment1');
    expect(results).toContain('user1#fragment2');
  });

  test('del() should remove key', () => {
    db.put('key', 'value');
    expect(db.get('key')).toBe('value');
    db.del('key');
    expect(db.get('key')).toBeUndefined();
  });
});
