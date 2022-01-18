import request from "supertest";
import { Ticket } from "../../models/ticket";
import { app } from "../../app";
import mongoose from "mongoose";

describe('show route', function () {
  it('should fetch the order', async function () {
    // create a ticket
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
    })
    await ticket.save()

    const user = global.signup()

    // make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201)

    // make request to feth the order
    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .expect(200)

    expect(fetchedOrder.id).toEqual(order.id);
  });

  it('should return an error if one user tries to fetch another users order', async function () {
    // create a ticket
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
    })
    await ticket.save()

    const user = global.signup()

    // make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201)

    // make request to feth the order
    await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', global.signup())
      .expect(401)

  });
});
