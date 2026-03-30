import { betterAuth } from 'better-auth/minimal';

import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../../prisma/client.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      role: {
        type: ['user', 'admin'],
        required: true,
        defaultValue: 'user',
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    disableSignUp: true,
  },
  trustedOrigins: ['http://localhost:5173'],
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
});

//  email: 'admin-aow@aow.ru', // required
//       password: 'admin-aow12345', // required
