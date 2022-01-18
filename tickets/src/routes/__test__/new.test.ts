import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it('should have a route handler listening to /api/tickets for post request', async function () {
  const response = await request(app)
    .post('/api/tickets').send({})

  expect(response.status).not.toEqual(404);
});

it('should be only accessible if the user is signed in', async function () {
  const response = await request(app)
    .post('/api/tickets').send({}).expect(401)
});

it('should return a status other than 401 if the user is signed in', async function () {
  const response = await request(app)
    .post('/api/tickets').set('Cookie', global.signup()).send({})

  expect(response.status).not.toEqual(401);
});

it('should return an error if an invalid title is provided', async function () {
  await request(app)
    .post('/api/tickets').set('Cookie', global.signup()).send({
      title: '',
      price: 10
    }).expect(400)

  await request(app)
    .post('/api/tickets').set('Cookie', global.signup()).send({
      price: 10
    }).expect(400)
});

it('should return an error if an invalid price is provided', async function () {
  await request(app)
    .post('/api/tickets').set('Cookie', global.signup()).send({
      title: 'asdads',
      price: -10
    }).expect(400)

  await request(app)
    .post('/api/tickets').set('Cookie', global.signup()).send({
      title: 'adasdasd'
    }).expect(400)
});

it('should create a ticket with valid inputs', async function () {

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets').set('Cookie', global.signup()).send({
      title: 'adasdasd',
      price: 20
    }).expect(201)

  tickets = await Ticket.find({})
  expect(tickets.length).toEqual(1);

});

it('should publish an event', async function () {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: 'new title',
      price: 123
    })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
});
