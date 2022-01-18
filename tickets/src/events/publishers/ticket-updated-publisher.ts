import { BasePublisher, Subjects, TicketUpdatedEvent } from "@stefan-tickets/common";

export class TicketUpdatedPublisher extends BasePublisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated
}
