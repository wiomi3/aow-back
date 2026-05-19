import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { prisma } from '../../../prisma/client.js';
import { EventSchema } from '../schemas.js';

const events = new OpenAPIHono();

async function checkCollisions(
  employeeIds: string[],
  startAt: Date,
  endAt: Date,
  excludeEventId?: string
) {
  if (!employeeIds || employeeIds.length === 0) return null;

  const overlappingEvents = await prisma.event.findMany({
    where: {
      id: excludeEventId ? { not: excludeEventId } : undefined,
      employees: {
        some: {
          id: { in: employeeIds },
        },
      },
      AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
    },
    include: {
      employees: {
        where: { id: { in: employeeIds } },
      },
    },
  });

  if (overlappingEvents.length > 0) {
    const event = overlappingEvents[0];
    const employee = event.employees[0];
    const startTime = event.startAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = event.endAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Сотрудник [${employee.name}] уже занят в событии [${event.title}] с ${startTime} до ${endTime}`;
  }

  return null;
}

const CreateEventSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  startAt: z.iso.datetime(),
  endAt: z.iso.datetime(),
  typeId: z.string().uuid(),
  locationId: z.string().uuid().nullable().optional(),
  employeeIds: z.array(z.string().uuid()).optional(),
});

const createEventRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateEventSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: EventSchema } },
      description: 'Event created successfully',
    },
    409: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Collision detected',
    },
  },
});

const updateEventRoute = createRoute({
  method: 'put',
  path: '/{id}',
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        'application/json': {
          schema: CreateEventSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: EventSchema } },
      description: 'Event updated successfully',
    },
    409: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Collision detected',
    },
  },
});

const deleteEventRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'Event deleted successfully',
    },
  },
});

events.openapi(createEventRoute, async (c) => {
  const { title, description, startAt, endAt, typeId, locationId, employeeIds } =
    c.req.valid('json');

  const start = new Date(startAt);
  const end = new Date(endAt);

  const collisionError = await checkCollisions(employeeIds || [], start, end);
  if (collisionError) {
    return c.json({ error: collisionError }, 409);
  }

  const data = await prisma.event.create({
    data: {
      title,
      description,
      startAt: start,
      endAt: end,
      typeId,
      locationId,
      employees: {
        connect: employeeIds?.map((id: string) => ({ id })),
      },
    },
  });
  return c.json(data as any);
});

events.openapi(updateEventRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { title, description, startAt, endAt, typeId, locationId, employeeIds } =
    c.req.valid('json');

  const start = new Date(startAt);
  const end = new Date(endAt);

  const collisionError = await checkCollisions(employeeIds || [], start, end, id);
  if (collisionError) {
    return c.json({ error: collisionError }, 409);
  }

  const data = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      startAt: start,
      endAt: end,
      typeId,
      locationId,
      employees: {
        set: employeeIds?.map((id: string) => ({ id })),
      },
    },
  });
  return c.json(data as any);
});

events.openapi(deleteEventRoute, async (c) => {
  const { id } = c.req.valid('param');
  await prisma.event.delete({
    where: { id },
  });
  return c.json({ success: true });
});

export default events;
