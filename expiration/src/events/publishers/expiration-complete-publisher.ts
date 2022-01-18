import { BasePublisher, ExpirationCompleteEvent, Subjects } from "@stefan-tickets/common";

export class ExpirationCompletePublisher extends BasePublisher<ExpirationCompleteEvent>{
  readonly subject = Subjects.ExpirationComplete;
}
