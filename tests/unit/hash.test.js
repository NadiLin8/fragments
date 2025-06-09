const { hashEmail } = require('../../src/hash');

describe('hashEmail()', () => {
  test('should hash email consistently', () => {
    const email = 'user@example.com';
    const hash1 = hashEmail(email);
    const hash2 = hashEmail(email);
    expect(hash1).toBe(hash2);
  });

  test('should normalize email case', () => {
    const email1 = 'User@Example.Com';
    const email2 = 'user@example.com';
    expect(hashEmail(email1)).toBe(hashEmail(email2));
  });

  test('should trim whitespace', () => {
    const email1 = '  user@example.com  ';
    const email2 = 'user@example.com';
    expect(hashEmail(email1)).toBe(hashEmail(email2));
  });
});
