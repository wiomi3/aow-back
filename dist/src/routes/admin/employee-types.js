import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { prisma } from '../../../prisma/client.js';
import { EmployeeTypeSchema, employeeTypeInputSchema } from '../../schemas.js';
const employeeTypes = new OpenAPIHono();
const listEmployeeTypesRoute = createRoute({
    method: 'get',
    path: '/',
    responses: {
        200: {
            content: { 'application/json': { schema: z.array(EmployeeTypeSchema) } },
            description: 'Retrieve all employee types',
        },
    },
});
const createEmployeeTypeRoute = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: employeeTypeInputSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: EmployeeTypeSchema } },
            description: 'Employee type created successfully',
        },
    },
});
const updateEmployeeTypeRoute = createRoute({
    method: 'put',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: {
            content: {
                'application/json': {
                    schema: employeeTypeInputSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: EmployeeTypeSchema } },
            description: 'Employee type updated successfully',
        },
    },
});
const deleteEmployeeTypeRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
            description: 'Employee type deleted successfully',
        },
    },
});
employeeTypes.openapi(listEmployeeTypesRoute, async (c) => {
    const data = await prisma.employeeType.findMany();
    return c.json(data);
});
employeeTypes.openapi(createEmployeeTypeRoute, async (c) => {
    const { name } = c.req.valid('json');
    const data = await prisma.employeeType.create({
        data: { name },
    });
    return c.json(data);
});
employeeTypes.openapi(updateEmployeeTypeRoute, async (c) => {
    const { id } = c.req.valid('param');
    const { name } = c.req.valid('json');
    const data = await prisma.employeeType.update({
        where: { id },
        data: { name },
    });
    return c.json(data);
});
employeeTypes.openapi(deleteEmployeeTypeRoute, async (c) => {
    const { id } = c.req.valid('param');
    await prisma.employeeType.delete({
        where: { id },
    });
    return c.json({ success: true });
});
export default employeeTypes;
