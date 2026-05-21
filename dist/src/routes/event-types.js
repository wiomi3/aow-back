import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { prisma } from '../../prisma/client.js';
import { EventTypeSchema } from '../schemas.js';
const eventTypes = new OpenAPIHono();
const listEventTypesRoute = createRoute({
    method: 'get',
    path: '/',
    responses: {
        200: {
            content: { 'application/json': { schema: z.array(EventTypeSchema) } },
            description: 'Retrieve all event types',
        },
    },
});
eventTypes.openapi(listEventTypesRoute, async (c) => {
    const data = await prisma.eventType.findMany();
    return c.json(data);
});
export default eventTypes;
