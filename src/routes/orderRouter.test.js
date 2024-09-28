const request = require('supertest');
const testConfig = require('../config-test.js');
const createApp = require('../service');
const { Role, DB } = require('../database/database.js');

function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }

async function createAdminUser(db) {
    let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
    user.name = randomName();
    user.email = user.name + '@admin.com';
  
    await db.addUser(user);
  
    user.password = 'toomanysecrets';
    return user;
}

let authToken;
let admin;
let app;

beforeAll(async () => { 
    testConfig.db.connection.database = 'pizza' 
    app = await createApp(testConfig)

    const db = new DB(testConfig);

    admin = await createAdminUser(db);
    const loginRes = await request(app).put('/api/auth').send(admin);
    authToken = loginRes.body.token;

    await request(app).put('/api/order/menu').send({
        title: 'New Item',
        description: 'A delicious new item',
        image: 'pizza9.png',
        price: 0.0002
    }).set('Authorization', `Bearer ${authToken}`);
})

describe('orderRouter', () => {
    test("get menu", async () => {
        const res = await request(app).get('/api/order/menu');
        expect(res.status).toBe(200);
        expect(res.body).toEqual([
            {
                title: 'New Item',
                description: 'A delicious new item',
                image: 'pizza9.png',
                price: 0.0002,
                id: 1
            } 
        ])
    });

    test("create order", async () => {
        const res = await request(app).post('/api/order').send({
            franchiseId: 1,
            storeId: 1,
            items: [{ menuId: 1, description: 'Student', price: 0.0001 }]
        }).set('Authorization', `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    })
})