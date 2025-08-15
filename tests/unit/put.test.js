const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  test('authenticated users can update their fragment', async () => {
    // First create a fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('original content');

    const fragmentId = postRes.body.fragment.id;

    // Then update it
    const putRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('updated content');

    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.fragment.size).toBe(15);
  });

  test('unauthenticated requests return 401', async () => {
    const res = await request(app)
      .put('/v1/fragments/test-id')
      .set('Content-Type', 'text/plain')
      .send('test');

    expect(res.statusCode).toBe(401);
  });

  test('non-existent fragment returns 404', async () => {
    const res = await request(app)
      .put('/v1/fragments/non-existent-id')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('test');

    expect(res.statusCode).toBe(404);
  });

  test('changing content type returns 400', async () => {
    // Create text fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('text content');

    const fragmentId = postRes.body.fragment.id;

    // Try to update with different type
    const putRes = await request(app)
      .put(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send('{"test": "json"}');

    expect(putRes.statusCode).toBe(400);
  });
});
