const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  let fragmentId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Hello World');
    
    fragmentId = res.body.fragment.id;
  });

  test('authenticated users can get their fragment', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello World');
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
  });

  test('unauthenticated requests return 401', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`);

    expect(res.statusCode).toBe(401);
  });

  test('non-existent fragment returns 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/nonexistent')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });
});
