import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteEvent, OrderStatus, TicketCreatedEvent } from "@stefan-tickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Order } from "../../../models/orders";

const setup = async () => {
  // create and instance of the listener
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'asdad',
    expiresAt: new Date(),
    ticket
  })
  await order.save();

  // create a fake data event
  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id
  }

  // create a fake message object
  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, order, ticket, data, msg };

}

describe('expiration complete listener',  function () {
  it('should create and save a ticket', async function () {
    const { listener, data, msg, ticket, order } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, <Message> msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)

  });

  it('should emit an OrderCancelled event', async function () {
    const { listener, data, msg, ticket, order } = await setup()
    await listener.onMessage(data, <Message> msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    expect(eventData.id).toEqual(order.id);
  });

  it('should ack the message', async function () {
    const { listener, data, msg, ticket, order } = await setup()

    await listener.onMessage(data, <Message> msg);

    expect(msg.ack).toHaveBeenCalled()

  });
});
