import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { prisma } from '../../../prisma/client.js';
import { LocationSchema } from '../schemas.js';

const locations = new OpenAPIHono();

const listLocationsRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(LocationSchema),
        },
      },
      description: 'Retrieve all locations',
    },
  },
});

const createLocationRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            address: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LocationSchema,
        },
      },
      description: 'Location created successfully',
    },
  },
});

const updateLocationRoute = createRoute({
  method: 'put',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            address: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: LocationSchema,
        },
      },
      description: 'Location updated successfully',
    },
  },
});

const deleteLocationRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
          }),
        },
      },
      description: 'Location deleted successfully',
    },
  },
});

locations.openapi(listLocationsRoute, async (c) => {
  const data = await prisma.location.findMany();
  return c.json(data as any);
});

locations.openapi(createLocationRoute, async (c) => {
  const { name, address } = c.req.valid('json');
  const data = await prisma.location.create({
    data: { name, address },
  });
  return c.json(data as any);
});

locations.openapi(updateLocationRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { name, address } = c.req.valid('json');
  const data = await prisma.location.update({
    where: { id },
    data: { name, address },
  });
  return c.json(data as any);
});

locations.openapi(deleteLocationRoute, async (c) => {
  const { id } = c.req.valid('param');
  await prisma.location.delete({
    where: { id },
  });
  return c.json({ success: true });
});

export default locations;
