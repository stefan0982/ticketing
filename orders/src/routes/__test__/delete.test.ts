import { Ticket } from "../../models/ticket";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/orders";
import { OrderStatus } from "@stefan-tickets/common";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";

describe('delete route', function () {
  it('should mark and order as cancelled', async function () {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
    })
    await ticket.save()

    const user = global.signup()

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201)

    const { body: fetchedOrder } = await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .expect(204)

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it('should emit an order cancelled event', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20
    })
    await ticket.save()

    const user = global.signup()

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201)

    const { body: fetchedOrder } = await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .expect(204)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

  });
});


