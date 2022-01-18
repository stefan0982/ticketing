import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@stefan-tickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create and instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client)

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }

  // create a fake message object
  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, data, msg };

}

describe('ticket create listener',  function () {
  it('should create and save a ticket', async function () {
    const { listener, data, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, <Message> msg);

    // write assertions to make sure ticket was created !
    const ticket = await Ticket.findById(data.id)

    expect(ticket).toBeDefined()
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);

  });

  it('should ack the message', async function () {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, <Message> msg);

    expect(msg.ack).toHaveBeenCalled()


  });
});
