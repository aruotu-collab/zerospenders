import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    email?: string | null;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/join",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        // Admin is email-locked: promote allowlisted owner; demote anyone else with ADMIN.
        let role = user.role;
        if (isAdminEmail(user.email)) {
          if (role !== "ADMIN") {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "ADMIN" },
            });
            role = "ADMIN";
          }
        } else if (role === "ADMIN") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "MEMBER" },
          });
          role = "MEMBER";
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }

      const email = user?.email ?? token.email;
      // Never grant ADMIN from DB role alone — only allowlisted emails.
      if (isAdminEmail(email)) {
        token.role = "ADMIN";
      } else if (token.role === "ADMIN") {
        token.role = "MEMBER";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        const email = session.user.email ?? token.email;
        session.user.role = isAdminEmail(email)
          ? "ADMIN"
          : token.role === "ADMIN"
            ? "MEMBER"
            : ((token.role as Role) ?? "MEMBER");
      }
      return session;
    },
  },
});
