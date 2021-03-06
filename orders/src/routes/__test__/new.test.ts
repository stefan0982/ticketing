import mongoose from "mongoose";
import { app } from "../../app";
import request from "supertest";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/orders";
import { OrderStatus } from "@stefan-tickets/common";
import { natsWrapper } from "../../nats-wrapper";

describe('new route', function () {
  it('should return an error if the ticket does not exist', async function () {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signup())
      .send({ ticketId })
      .expect(404)
  });

  it('should return an error if the ticket is already reserved', async function () {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
    })
    await ticket.save();
    const order = Order.build({
      ticket,
      userId: 'asdadasd',
      status: OrderStatus.Created,
      expiresAt: new Date()
    })
    await order.save()

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signup())
      .send({ticketId: ticket.id})
      .expect(400)
  });

  it('should reserve a ticket', async function () {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
    })
    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signup())
      .send({ticketId: ticket.id})
      .expect(201)
  });

  it('emits an order created event', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
    })
    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signup())
      .send({ticketId: ticket.id})
      .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
  })
});


