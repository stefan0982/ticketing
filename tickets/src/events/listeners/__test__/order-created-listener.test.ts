import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import { OrderCreatedEvent, OrderStatus } from "@stefan-tickets/common";
import mongoose, { set } from "mongoose";
import { Message } from "node-nats-streaming";

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'asd'
  })
  await ticket.save();

  // create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asdda',
    expiresAt: 'asdadasd',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  }

  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg }
}

describe('order created listener', function () {
  it('should set the userId of the ticket', async function () {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, <Message> msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
  });

  it('should ack the message', async function () {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, <Message> msg);

    expect(msg.ack).toHaveBeenCalled()
  });

  it('should publish a ticket ', async function () {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, <Message> msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    expect(data.id).toEqual(ticketUpdatedData.orderId);
  });
});

