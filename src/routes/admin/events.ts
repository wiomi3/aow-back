import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { prisma } from '../../../prisma/client.js';
import { EventWithDetailsSchema, eventInputSchema } from '../../schemas.js';

const events = new OpenAPIHono();

const includeDetails = {
  type: true,
  location: true,
  employees: {
    include: {
      employeeType: true,
    },
  },
  additionalOrgs: true,
};

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

const getEventsRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(EventWithDetailsSchema) } },
      description: 'Get all events',
    },
  },
});

const getEventByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: EventWithDetailsSchema } },
      description: 'Get event by id',
    },
    404: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Event not found',
    },
  },
});

events.openapi(getEventsRoute, async (c) => {
  const { start, end } = c.req.valid('query');

  const whereClause: any = {};
  if (start && end) {
    whereClause.AND = [{ startAt: { lt: new Date(end) } }, { endAt: { gt: new Date(start) } }];
  }

  const data = await prisma.event.findMany({
    where: whereClause,
    include: includeDetails,
  });

  return c.json(data as any);
});

events.openapi(getEventByIdRoute, async (c) => {
  const { id } = c.req.valid('param');

  const data = await prisma.event.findUnique({
    where: { id },
    include: includeDetails,
  });

  if (!data) {
    return c.json({ error: 'Event not found' }, 404);
  }

  return c.json(data as any);
});
const createEventRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: eventInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: EventWithDetailsSchema } },
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
          schema: eventInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: EventWithDetailsSchema } },
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
  const { title, description, startAt, endAt, typeId, locationId, employeeIds, additionalOrgIds } =
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
      additionalOrgs: {
        connect: additionalOrgIds?.map((id: string) => ({ id })),
      },
    },
    include: includeDetails,
  });
  return c.json(data as any);
});

events.openapi(updateEventRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { title, description, startAt, endAt, typeId, locationId, employeeIds, additionalOrgIds } =
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
      additionalOrgs: {
        set: additionalOrgIds?.map((id: string) => ({ id })) ?? [],
      },
    },
    include: includeDetails,
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
