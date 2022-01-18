import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "@stefan-tickets/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrderAttributes {
  id: string;
  version: number;
  price: number;
  userId: string;
  status: OrderStatus
}

interface OrderDoc extends mongoose.Document{
  version: number;
  price: number;
  userId: string;
  status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc>{
  build(attrs: OrderAttributes): OrderDoc;
}

const orderSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  price: { type: Number, required: true },
  status: { type: String, required: true }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
})

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttributes) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status,
  })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
