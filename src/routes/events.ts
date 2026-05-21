import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { prisma } from '../../prisma/client.js';
import { EventWithDetailsSchema } from '../schemas.js';

const events = new OpenAPIHono();

const getEventsRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: z.object({
      start: z.string().optional().openapi({ example: '2026-05-01' }),
      end: z.string().optional().openapi({ example: '2026-05-31' }),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(EventWithDetailsSchema),
        },
      },
      description: 'List of events in the date range',
    },
    400: {
      description: 'Missing query parameters',
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
    include: {
      type: true,
      location: true,
      employees: {
        include: {
          employeeType: true,
        },
      },
      additionalOrgs: true,
    },
  });

  // Prisma objects have Date objects, but schema expects ISO strings
  // @hono/zod-openapi handles serialization if types match, but we need to be careful with types
  return c.json(data as any);
});

export default events;
