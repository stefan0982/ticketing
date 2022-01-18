import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedEvent } from "@stefan-tickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  })
  await ticket.save();

  // create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'concert 2',
    price: 10,
    userId: 'smth',
  }

  // create a fake message object
  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  // create a fake data object
  return { listener, data, msg, ticket };

}

describe('ticket create listener',  function () {
  it('should find, update and save a ticket', async function () {
    const { listener, data, msg, ticket } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, <Message> msg);

    // write assertions to make sure ticket was created !
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.version).toEqual(data.version);
    expect(updatedTicket!.price).toEqual(data.price);

  });

  it('should ack the message', async function () {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, <Message> msg);

    expect(msg.ack).toHaveBeenCalled()
  });

  it('should not call ack if the event has a skipped version number', async function () {
    const { msg, data, listener, ticket } = await setup();

    data.version = 10;

    try {
      await listener.onMessage(data, <Message> msg);
    } catch ( e ) {

    }

    expect(msg.ack).not.toHaveBeenCalled();
  });
});
