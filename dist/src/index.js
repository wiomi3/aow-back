import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { auth } from './lib/auth.js';
import { cors } from 'hono/cors';
const app = new OpenAPIHono();
// CORS MUST come before routes
app.use('*', cors({
    // origin: 'http://localhost:5173',
    origin: ['http://localhost:5173', 'https://aow-front.vercel.app'],
    allowHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));
// Session middleware - adds user/session to context
app.use('*', async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    c.set('user', session?.user ?? null);
    c.set('session', session?.session ?? null);
    await next();
});
// Admin middleware
const adminMiddleware = async (c, next) => {
    const user = c.get('user');
    if (!user || user.role !== 'admin') {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    await next();
};
// Mount Better Auth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});
// Routes
import events from './routes/events.js';
import eventTypesPublic from './routes/event-types.js';
import adminEvents from './routes/admin/events.js';
import locations from './routes/admin/locations.js';
import eventTypes from './routes/admin/event-types.js';
import employees from './routes/admin/employees.js';
import employeeTypes from './routes/admin/employee-types.js';
app.route('/api/events', events);
app.route('/api/event-types', eventTypesPublic);
// Protected admin routes
app.use('/api/admin/*', adminMiddleware);
app.route('/api/admin/events', adminEvents);
app.route('/api/admin/locations', locations);
app.route('/api/admin/event-types', eventTypes);
app.route('/api/admin/employees', employees);
app.route('/api/admin/employee-types', employeeTypes);
// Swagger UI
app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
        title: 'Event Calendar API',
        version: '1.0.0',
    },
});
app.get('/swagger-ui', swaggerUI({ url: '/openapi.json' }));
// Protected route example
app.get('/api/me', (c) => {
    const user = c.get('user');
    if (!user)
        return c.json({ error: 'Unauthorized' }, 401);
    return c.json({ user });
});
const welcomeStrings = [
    'Hello Hono!',
    'To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono',
    'Swagger docs available at /swagger-ui',
];
app.get('/', (c) => {
    return c.text(welcomeStrings.join('\n\n'));
});
export default app;
