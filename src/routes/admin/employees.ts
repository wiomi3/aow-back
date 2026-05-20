import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { prisma } from '../../../prisma/client.js';
import { EmployeeSchema, employeeInputSchema } from '../../schemas.js';

const employees = new OpenAPIHono();

const listEmployeesRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: { 'application/json': { schema: z.array(EmployeeSchema) } },
      description: 'Retrieve all employees',
    },
  },
});

const createEmployeeRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: employeeInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: EmployeeSchema } },
      description: 'Employee created successfully',
    },
  },
});

const updateEmployeeRoute = createRoute({
  method: 'put',
  path: '/{id}',
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      content: {
        'application/json': {
          schema: employeeInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: { 'application/json': { schema: EmployeeSchema } },
      description: 'Employee updated successfully',
    },
  },
});

const deleteEmployeeRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      description: 'Employee deleted successfully',
    },
  },
});

employees.openapi(listEmployeesRoute, async (c) => {
  const data = await prisma.employee.findMany({
    include: { employeeType: true },
  });
  return c.json(data as any);
});

employees.openapi(createEmployeeRoute, async (c) => {
  const { name, employeeTypeId } = c.req.valid('json');
  const data = await prisma.employee.create({
    data: { name, employeeTypeId },
  });
  return c.json(data as any);
});

employees.openapi(updateEmployeeRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { name, employeeTypeId } = c.req.valid('json');
  const data = await prisma.employee.update({
    where: { id },
    data: { name, employeeTypeId },
  });
  return c.json(data as any);
});

employees.openapi(deleteEmployeeRoute, async (c) => {
  const { id } = c.req.valid('param');
  await prisma.employee.delete({
    where: { id },
  });
  return c.json({ success: true });
});

export default employees;
