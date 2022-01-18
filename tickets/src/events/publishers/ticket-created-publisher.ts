import { BasePublisher, Subjects, TicketCreatedEvent } from "@stefan-tickets/common";

export class TicketCreatedPublisher extends BasePublisher<TicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated

}
