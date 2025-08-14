const FragmentConverter = require('../../src/model/fragment-converter');

describe('FragmentConverter', () => {
  test('should convert markdown to HTML', () => {
    const converter = new FragmentConverter();
    const result = converter.convert('# Hello', 'text/markdown', '.html');
    
    expect(result.contentType).toBe('text/html');
    expect(result.data).toContain('<h1>Hello</h1>');
  });

  test('should convert markdown to text', () => {
    const converter = new FragmentConverter();
    const result = converter.convert('# Hello', 'text/markdown', '.txt');
    
    expect(result.contentType).toBe('text/plain');
    expect(result.data).toBe('# Hello');
  });

  test('isValidConversion should work', () => {
    expect(FragmentConverter.isValidConversion('text/markdown', '.html')).toBe(true);
    expect(FragmentConverter.isValidConversion('text/plain', '.html')).toBe(false);
  });

  test('getValidExtensions should return correct extensions', () => {
    const extensions = FragmentConverter.getValidExtensions('text/markdown');
    expect(extensions).toContain('.html');
    expect(extensions).toContain('.txt');
  });
});
