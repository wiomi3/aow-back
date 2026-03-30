import { Hono } from 'hono';
import { auth } from './lib/auth.js';
import { cors } from 'hono/cors';
import { prisma } from '../prisma/client.js';

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();
// CORS MUST come before routes
app.use(
  '/api/auth/*',
  cors({
    origin: 'http://localhost:5173', // Vite dev server port
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true, // Required for cookies
  })
);
// Session middleware - adds user/session to context
app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('user', session?.user ?? null);
  c.set('session', session?.session ?? null);
  await next();
});
// Mount Better Auth handler
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw);
});
// Protected route example
app.get('/api/me', (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  return c.json({ user });
});

const welcomeStrings = [
  'Hello Hono!',
  'To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono',
];

app.get('/', (c) => {
  return c.text(welcomeStrings.join('\n\n'));
});

export default app;
