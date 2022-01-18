import request from 'supertest';
import { app } from "../../app";

it('should return a 201 on a successful signup', function () {
  return request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'test'
  })
    .expect(201)
});

it('should return a 400 with an invalid email', function () {
  return request(app).post('/api/users/signup').send({
    email: 'testtest.com',
    password: 'test'
  })
    .expect(400)
});

it('should return a 400 with an invalid password', function () {
  return request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: ''
  })
    .expect(400)
});

it('should return a 400 with missing email and password', function () {
  return request(app).post('/api/users/signup').send({})
    .expect(400)
});

it('should disallow duplicate emails', async function () {
  await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'test'
  })
    .expect(201)

  await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'test'
  })
    .expect(400)
});

it('should set a cookie after successful signup', async function () {
  const response = await request(app).post('/api/users/signup').send({
    email: 'test@test.com',
    password: 'test'
  })
    .expect(201)

  expect(response.get('Set-Cookie')).toBeDefined()
});


