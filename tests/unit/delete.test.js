const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  test('authenticated users can delete their fragment', async () => {
    // First create a fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('test fragment');

    const fragmentId = postRes.body.fragment.id;

    // Then delete it
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${fragmentId}`)
      .auth('user1@email.com', 'password1');

    expect(deleteRes.statusCode).toBe(200);
  });

  test('unauthenticated requests return 401', async () => {
    const res = await request(app)
      .delete('/v1/fragments/test-id');

    expect(res.statusCode).toBe(401);
  });

  test('non-existent fragment returns 404', async () => {
    const res = await request(app)
      .delete('/v1/fragments/non-existent-id')
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });
});
