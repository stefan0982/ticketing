import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from "@stefan-tickets/common";
import mongoose from "mongoose";
import nats, { Message } from "node-nats-streaming";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString()
  // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'asd'
  })
  ticket.set({ orderId })
  await ticket.save();

  // create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    }
  }

  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg, orderId }
}

describe('order cancelled listener', function () {
  it('should update the ticket, publish an event and ack the message', async function () {
    const { listener, ticket, data, msg, orderId } = await setup();

    await listener.onMessage(data, <Message> msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined()
    expect(msg.ack).toHaveBeenCalled()
    expect(natsWrapper.client.publish).toHaveBeenCalled()

  });
});
