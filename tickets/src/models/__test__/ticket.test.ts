import { Ticket } from "../ticket";


it('should implement optimistic concurrency control', async function () {

  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123'
  })

  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 })

  await firstInstance!.save();

  try {
    await secondInstance!.save();
  } catch ( e ) {
    return;
  }

  throw new Error('should not reach this point')

});

it('should increment the version number on multiple saves', async function () {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123'
  })

  await ticket.save();

  expect(ticket.version).toEqual(0)

  await ticket.save()
  expect(ticket.version).toEqual(1)
  await ticket.save()
  expect(ticket.version).toEqual(2)

});
