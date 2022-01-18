import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedEvent, OrderStatus } from "@stefan-tickets/common";
import mongoose, { set } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asdda',
    expiresAt: 'asdadasd',
    ticket: {
      id: 'adsasd',
      price: 10
    }
  }

  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, data, msg }
}

describe('order created listener', function () {
  it('should replicate the order info', async function () {
    const { listener,  data, msg } = await setup();

    await listener.onMessage(data, <Message> msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);

  });

  it('should ack the message', async function () {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, <Message> msg);

    expect(msg.ack).toHaveBeenCalled()
  });
});

