import { betterAuth } from "better-auth";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../prisma/client";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            role: {
                type: ["user", "admin"],
                required: true,
                defaultValue: "user",
                input: false,
            },
        },
    },
    emailAndPassword: {
        enabled: true,
    },
});
