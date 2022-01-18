import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order } from "../../models/order";
import { OrderStatus } from "@stefan-tickets/common";
import { stripe } from "../../stripe";

jest.mock('../../stripe')

describe('new route tests', function () {
  it('should return a 404 when purchasing an order that does not exist', async function () {
    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signup())
      .send({
        token: 'adsads',
        orderId: new mongoose.Types.ObjectId().toHexString()
      })
      .expect(404)
  });

  it('should return a 401 when purchasing an order that does not belong to the user', async function () {
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      price: 20,
      status: OrderStatus.Created
    })
    await order.save()

    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signup())
      .send({
        token: 'adsads',
        orderId: order.id
      })
      .expect(401)
  });

  it('should return a 404 when purchasing a cancelled order', async function () {
    const userId = new mongoose.Types.ObjectId().toHexString()

    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId,
      version: 0,
      price: 20,
      status: OrderStatus.Cancelled
    })
    await order.save()

    await request(app)
      .post('/api/payments')
      .set('Cookie', global.signup(userId))
      .send({
        token: 'adsads',
        orderId: order.id
      })
      .expect(400)
  });

  // it('should return a 201 with valid inputs', async function () {
  //   const userId = new mongoose.Types.ObjectId().toHexString()
  //   const price = Math.floor(Math.random() * 100000 )
  //
  //   const order = Order.build({
  //     id: new mongoose.Types.ObjectId().toHexString(),
  //     userId,
  //     version: 0,
  //     price: 20,
  //     status: OrderStatus.Created
  //   })
  //   await order.save()
  //
  //   await request(app)
  //     .post('/api/payments')
  //     .set('Cookie', global.signup(userId))
  //     .send({
  //       token: 'tok_visa',
  //       orderId: order.id
  //     })
  //     .expect(201)
  //
  //   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  //
  //   expect(chargeOptions.source).toEqual('tok_visa')
  //   expect(chargeOptions.amount).toEqual(20 * 100);
  //
  //   // const payment = await Payment.findOne({
  //   //   orderId: order.id,
  //   //   stripeId: 'asd'
  //   // })
  //
  //
  //
  // });
});
