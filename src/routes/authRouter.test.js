const request = require('supertest');
const testConfig = require('../config-test.js');
const createApp = require('../service');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let userId;
let app;

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

beforeAll(async () => {
  testConfig.db.connection.database = 'pizza'; 
  app = await createApp(testConfig)
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  userId = registerRes.body.user.id;
});

describe('authRouter', () => {
  test('login', async () => {
    const loginRes = await request(app).put('/api/auth').send(testUser);
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
    
    const { password, ...user } = { ...testUser, roles: [{ role: 'diner' }] };
    expect(loginRes.body.user).toMatchObject(user);
    expect(password).toBeDefined()
  });
  
  test("edit user's own info", async () => {
    await request(app).put('/api/auth').send(testUser);

    const editRes = await request(app)
      .put(`/api/auth/${userId}`)
      .send(testUser) 
      .set('Authorization', `Bearer ${testUserAuthToken}`);
    
    expect(editRes.status).toBe(200);
  });
});
