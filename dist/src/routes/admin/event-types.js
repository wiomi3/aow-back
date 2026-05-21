import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { prisma } from '../../../prisma/client.js';
import { EventTypeSchema, eventTypeInputSchema } from '../../schemas.js';
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
const createEventTypeRoute = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: eventTypeInputSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: EventTypeSchema } },
            description: 'Event type created successfully',
        },
    },
});
const updateEventTypeRoute = createRoute({
    method: 'put',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: {
            content: {
                'application/json': {
                    schema: eventTypeInputSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: EventTypeSchema } },
            description: 'Event type updated successfully',
        },
    },
});
const deleteEventTypeRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
            description: 'Event type deleted successfully',
        },
    },
});
eventTypes.openapi(listEventTypesRoute, async (c) => {
    const data = await prisma.eventType.findMany();
    return c.json(data);
});
eventTypes.openapi(createEventTypeRoute, async (c) => {
    const { name, color } = c.req.valid('json');
    const data = await prisma.eventType.create({
        data: { name, color },
    });
    return c.json(data);
});
eventTypes.openapi(updateEventTypeRoute, async (c) => {
    const { id } = c.req.valid('param');
    const { name, color } = c.req.valid('json');
    const data = await prisma.eventType.update({
        where: { id },
        data: { name, color },
    });
    return c.json(data);
});
eventTypes.openapi(deleteEventTypeRoute, async (c) => {
    const { id } = c.req.valid('param');
    await prisma.eventType.delete({
        where: { id },
    });
    return c.json({ success: true });
});
export default eventTypes;
