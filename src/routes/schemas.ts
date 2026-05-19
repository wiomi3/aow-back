import { z } from '@hono/zod-openapi';

export const LocationSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    name: z.string().openapi({ example: 'Концертный зал' }),
    address: z.string().openapi({ example: 'ул. Пушкина, 10' }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('Location');

export const EventTypeSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    name: z.string().openapi({ example: 'Концерт' }),
    color: z.string().openapi({ example: '#FF5733' }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('EventType');

export const EmployeeTypeSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    name: z.string().openapi({ example: 'Вокалист' }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('EmployeeType');

export const EmployeeSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    name: z.string().openapi({ example: 'Иван Иванов' }),
    employeeTypeId: z.string().uuid(),
    employeeType: EmployeeTypeSchema.optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('Employee');

export const EventSchema = z
  .object({
    id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    title: z.string().openapi({ example: 'Вечерний джаз' }),
    description: z.string().nullable().openapi({ example: 'Живая музыка и уютная атмосфера' }),
    startAt: z.iso.datetime().openapi({ example: '2026-05-20T18:00:00Z' }),
    endAt: z.iso.datetime().openapi({ example: '2026-05-20T20:00:00Z' }),
    typeId: z.string().uuid(),
    type: EventTypeSchema.optional(),
    locationId: z.string().uuid().nullable(),
    location: LocationSchema.optional().nullable(),
    employees: z.array(EmployeeSchema).optional(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('Event');
