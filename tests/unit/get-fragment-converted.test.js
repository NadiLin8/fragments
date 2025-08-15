const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id.ext', () => {
  test('authenticated users can convert markdown to html', async () => {
    // Create markdown fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# Hello\nThis is **bold** text.');

    const fragmentId = postRes.body.fragment.id;

    // Convert to HTML
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.html`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/html');
    expect(getRes.text).toContain('<h1>Hello</h1>');
    expect(getRes.text).toContain('<strong>bold</strong>');
  });

  test('markdown to text conversion returns 415 (unsupported)', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# Hello\nThis is **bold** text.');

    const fragmentId = postRes.body.fragment.id;

    // This conversion is not supported in your current implementation
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(415);
  });

  test('authenticated users can convert HTML to text', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>Hello</h1><p>This is <strong>bold</strong> text</p>');

    const fragmentId = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toContain('Hello');
    expect(getRes.text).toContain('bold');
  });

  test('authenticated users can convert plain text to text', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hello world');

    const fragmentId = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toBe('Hello world');
  });

  test('authenticated users can convert JSON to text', async () => {
    const jsonData = '{"name": "John", "age": 30}';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send(jsonData);

    const fragmentId = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
  });

  test('authenticated users can get fragment without extension', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hello world');

    const fragmentId = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toContain('text/plain');
    expect(getRes.text).toBe('Hello world');
  });

  test('image conversion with valid PNG data', async () => {
    // Create a more complete valid PNG buffer
    const sharp = require('sharp');
    
    // Create a simple 1x1 white PNG using sharp
    const pngBuffer = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(pngBuffer);

    const fragmentId = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.jpg`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/jpeg');
  });

  test('image conversion PNG to WebP', async () => {
    const sharp = require('sharp');
    
    const pngBuffer = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(pngBuffer);

    const fragmentId = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.webp`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/webp');
  });

  test('image conversion PNG to GIF', async () => {
    const sharp = require('sharp');
    
    const pngBuffer = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(pngBuffer);

    const fragmentId = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.gif`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/gif');
  });

  test('conversion error handling with server error', async () => {
    // Create a fragment with corrupted data to trigger conversion error
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(Buffer.from('invalid image data'));

    const fragmentId = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.jpg`)
      .auth('user1@email.com', 'password1');

    // This should return 415 for unsupported conversion or 500 for server error
    expect([415, 500]).toContain(getRes.statusCode);
  });

  test('unsupported conversion returns 415', async () => {
    // Create text fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('plain text');

    const fragmentId = postRes.body.fragment.id;

    // Try unsupported conversion
    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.pdf`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(415);
  });

  test('unsupported image conversion returns 415', async () => {
    const sharp = require('sharp');
    
    const pngBuffer = await sharp({
      create: {
        width: 1,
        height: 1,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(pngBuffer);

    const fragmentId = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${fragmentId}.bmp`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(415);
  });

  test('non-existent fragment returns 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent.html')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });

  test('unauthenticated request returns 401', async () => {
    const res = await request(app)
      .get('/v1/fragments/some-id.html');

    expect(res.statusCode).toBe(401);
  });
});
