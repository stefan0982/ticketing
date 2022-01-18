import { BasePublisher, OrderCancelledEvent, Subjects } from "@stefan-tickets/common";

export class OrderCancelledPublisher extends BasePublisher<OrderCancelledEvent>{
  readonly subject = Subjects.OrderCancelled
}
