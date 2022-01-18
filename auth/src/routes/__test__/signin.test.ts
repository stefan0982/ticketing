import request from "supertest";
import { app } from "../../app";

it('should fail when email that does not exist is supplied', async function () {
  await request(app).post('/api/users/signin').send({
    email: 'test@test.com',
    password: 'test'
  })
    .expect(400)
});

it('should fail when an incorrect password is supplied', async function () {
  await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'test'
  })
    .expect(201)

  await request(app).post('/api/users/signin').send({
    email: 'test@test.com',
    password: 'testasdads'
  })
    .expect(400)
});

// it('should respond with a cookie when given valid credentials', async function () {
//   await request(app).post('/api/users/signup').send({
//     email: 'test@test.com',
//     password: 'test'
//   })
//     .expect(201)
//
//   const response  = await request(app).post('/api/users/signin').send({
//     email: 'test@test.com',
//     password: 'test'
//   })
//     .expect(200)
//
//   expect(response.get('Set-Cookie')).toBeDefined();
// });

