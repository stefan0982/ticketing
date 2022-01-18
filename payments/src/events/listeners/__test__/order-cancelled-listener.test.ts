import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from "@stefan-tickets/common";
import mongoose, { set } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asdda',
    price: 10
  })
  await order.save()

  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'asdasddas'
    }
  }

  const msg: Partial<Message> = {
    ack: jest.fn()
  }

  return { listener, data, order, msg }
}

describe('order cancelled listener', function () {
  it('should update the status of the order', async function () {
    const { listener,  data, msg, order } = await setup();

    await listener.onMessage(data, <Message> msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)

  });

  it('should ack the message', async function () {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, <Message> msg);

    expect(msg.ack).toHaveBeenCalled()
  });
});

