import request from "supertest";
import { app } from "../../app";

it('should respond with details about the current user', async function () {
  const cookie = await global.signup()

  const response = await request(app).get('/api/users/currentuser').set('Cookie', cookie).send({})
    .expect(400)

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('should respond with null if not authenticated', async function () {
  const cookie = await global.signup()

  const response = await request(app).get('/api/users/currentuser').send({})
    .expect(200)

  expect(response.body.currentUser).toEqual(null);
});

