import { BasePublisher, PaymentCreatedEvent, Subjects } from "@stefan-tickets/common";

export class PaymentCreatedPublisher extends BasePublisher<PaymentCreatedEvent>{
  readonly subject = Subjects.PaymentCreated;

}
