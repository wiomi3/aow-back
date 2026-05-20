import { z } from '@hono/zod-openapi';

// ==========================================
// 1. EmployeeType (Тип сотрудника)
// ==========================================

export const employeeTypeInputSchema = z.object({
  name: z.string().min(2, 'Название должно содержать минимум 2 символа').trim().openapi({ example: 'Вокалист' }),
});


export const employeeTypeResponseSchema = employeeTypeInputSchema.extend({
  id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).openapi('EmployeeType');

export type EmployeeTypeInputDTO = z.infer<typeof employeeTypeInputSchema>;
export type EmployeeTypeResponseDTO = z.infer<typeof employeeTypeResponseSchema>;

// Alias for compatibility with existing routes
export const EmployeeTypeSchema = employeeTypeResponseSchema;

// ==========================================
// 2. Employee (Сотрудник)
// ==========================================

export const employeeInputSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').trim().openapi({ example: 'Иван Иванов' }),
  employeeTypeId: z.string().uuid('Некорректный ID типа сотрудника').openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
});

export const employeeResponseSchema = employeeInputSchema.extend({
  id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  employeeType: employeeTypeResponseSchema.optional(),
}).openapi('Employee');

export type EmployeeInputDTO = z.infer<typeof employeeInputSchema>;
export type EmployeeResponseDTO = z.infer<typeof employeeResponseSchema>;

// Alias for compatibility with existing routes
export const EmployeeSchema = employeeResponseSchema;

// ==========================================
// 3. EventType (Тип события)
// ==========================================

export const eventTypeInputSchema = z.object({
  name: z.string().min(2, 'Название обязательно').trim().openapi({ example: 'Концерт' }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Требуется валидный HEX-код (например, #FF5733)').openapi({ example: '#FF5733' }),
});

export const eventTypeResponseSchema = eventTypeInputSchema.extend({
  id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).openapi('EventType');

export type EventTypeInputDTO = z.infer<typeof eventTypeInputSchema>;
export type EventTypeResponseDTO = z.infer<typeof eventTypeResponseSchema>;

// Alias for compatibility with existing routes
export const EventTypeSchema = eventTypeResponseSchema;

// ==========================================
// 4. Location (Площадка/Локация)
// ==========================================

export const locationInputSchema = z.object({
  name: z.string().min(2, 'Название локации обязательно').trim().openapi({ example: 'Концертный зал' }),
  address: z.string().min(5, 'Укажите полный адрес').trim().openapi({ example: 'ул. Пушкина, 10' }),
});

export const locationResponseSchema = locationInputSchema.extend({
  id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).openapi('Location');

export type LocationInputDTO = z.infer<typeof locationInputSchema>;
export type LocationResponseDTO = z.infer<typeof locationResponseSchema>;

// Alias for compatibility with existing routes
export const LocationSchema = locationResponseSchema;

// ==========================================
// 5. Event (Событие)
// ==========================================

export const eventInputSchema = z
  .object({
    title: z.string().min(3, 'Название события обязательно').trim().openapi({ example: 'Вечерний джаз' }),
    description: z.string().nullable().optional().openapi({ example: 'Живая музыка и уютная атмосфера' }),
    startAt: z.string().datetime({ message: 'Ожидается валидная дата начала (ISO 8601)' }).openapi({ example: '2026-05-20T18:00:00Z' }),
    endAt: z.string().datetime({ message: 'Ожидается валидная дата окончания (ISO 8601)' }).openapi({ example: '2026-05-20T20:00:00Z' }),
    typeId: z.string().uuid('Выберите тип события').openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    locationId: z.string().uuid('Выберите локацию').nullable().optional().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    employeeIds: z
      .array(z.string().uuid('Некорректный ID сотрудника'))
      .min(1, 'Назначьте как минимум одного сотрудника')
      .optional()
      .openapi({ example: ['123e4567-e89b-12d3-a456-426614174000'] }),
  })
  .refine(
    (data) => {
      const start = new Date(data.startAt);
      const end = new Date(data.endAt);
      return end > start;
    },
    {
      message: 'Дата окончания события должна быть строго позже даты начала',
      path: ['endAt'],
    }
  );

export const eventResponseSchema = z.object({
  id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  title: z.string(),
  description: z.string().nullable(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  typeId: z.string().uuid(),
  locationId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  type: eventTypeResponseSchema.optional(),
  location: locationResponseSchema.nullable().optional(),
  employees: z.array(employeeResponseSchema).optional(),
}).openapi('Event');

export type EventInputDTO = z.infer<typeof eventInputSchema>;
export type EventResponseDTO = z.infer<typeof eventResponseSchema>;

// Alias for compatibility with existing routes
export const EventSchema = eventResponseSchema;
