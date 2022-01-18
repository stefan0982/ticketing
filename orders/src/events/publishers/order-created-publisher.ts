import { BasePublisher, OrderCreatedEvent, Subjects } from "@stefan-tickets/common";

export class OrderCreatedPublisher extends BasePublisher<OrderCreatedEvent>{
  readonly subject = Subjects.OrderCreated
}
