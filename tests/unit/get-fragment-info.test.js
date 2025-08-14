const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
  test('authenticated users can get fragment info', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Test fragment info');
    
    const id = JSON.parse(postRes.text).fragment.id;
    
    const res = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');
      
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(res.body.fragment.id).toBe(id);
  });

  test('unauthenticated requests return 401', async () => {
    const res = await request(app)
      .get('/v1/fragments/test-id/info');
      
    expect(res.statusCode).toBe(401);
  });

  test('non-existent fragment returns 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent-id/info')
      .auth('user1@email.com', 'password1');
      
    expect(res.statusCode).toBe(404);
  });
});
