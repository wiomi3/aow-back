import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { prisma } from '../../../prisma/client.js';
import { AdditionalOrgSchema, additionalOrgInputSchema } from '../../schemas.js';

const additionalOrgs = new OpenAPIHono();

const listRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(AdditionalOrgSchema) } },
      description: 'Retrieve all additional orgs',
    },
  },
});

const getByIdRoute = createRoute({
  method: 'get',
  path: '/{id}',
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: AdditionalOrgSchema } },
      description: 'AdditionalOrg found',
    },
    404: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Not found',
    },
  },
});

const createRoute_ = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: { content: { 'application/json': { schema: additionalOrgInputSchema } } },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: AdditionalOrgSchema } },
      description: 'AdditionalOrg created',
    },
    409: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Conflict: name or phone already exists',
    },
  },
});

const updateRoute = createRoute({
  method: 'put',
  path: '/{id}',
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: additionalOrgInputSchema } } },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: AdditionalOrgSchema } },
      description: 'AdditionalOrg updated',
    },
    409: {
      content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      description: 'Conflict: name or phone already exists',
    },
  },
});

const deleteRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'AdditionalOrg deleted',
    },
  },
});

additionalOrgs.openapi(listRoute, async (c) => {
  const data = await prisma.additionalOrgs.findMany();
  return c.json(data as any);
});

additionalOrgs.openapi(getByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const data = await prisma.additionalOrgs.findUnique({ where: { id } });
  if (!data) return c.json({ error: 'Not found' }, 404);
  return c.json(data as any);
});

additionalOrgs.openapi(createRoute_, async (c) => {
  const body = c.req.valid('json');
  try {
    const data = await prisma.additionalOrgs.create({ data: body });
    return c.json(data as any);
  } catch (e: any) {
    if (e.code === 'P2002')
      return c.json({ error: 'Организация с таким названием или телефоном уже существует' }, 409);
    throw e;
  }
});

additionalOrgs.openapi(updateRoute, async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');
  try {
    const data = await prisma.additionalOrgs.update({ where: { id }, data: body });
    return c.json(data as any);
  } catch (e: any) {
    if (e.code === 'P2002')
      return c.json({ error: 'Организация с таким названием или телефоном уже существует' }, 409);
    throw e;
  }
});

additionalOrgs.openapi(deleteRoute, async (c) => {
  const { id } = c.req.valid('param');
  await prisma.additionalOrgs.delete({ where: { id } });
  return c.json({ success: true });
});

export default additionalOrgs;
