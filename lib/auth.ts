import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";

import { prisma } from "@/lib/prisma";

const fromAddress = process.env.EMAIL_FROM ?? "no-reply@mainstreet.dev";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: fromAddress,
      async sendVerificationRequest({ identifier, url }) {
        if (!process.env.EMAIL_SERVER) {
          console.info(`Magic link for ${identifier}:\n${url}`);
          return;
        }

        const nodemailer = await import("nodemailer");
        const transport = nodemailer.createTransport(process.env.EMAIL_SERVER);

        await transport.sendMail({
          to: identifier,
          from: fromAddress,
          subject: "Your Main Street Agent login link",
          text: `Sign in by clicking the link: ${url}`,
          html: `<p>Sign in by clicking the link below:</p><p><a href="${url}">Complete sign in</a></p>`,
        });
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.name = user.name ?? session.user.name;
        session.user.email = user.email ?? session.user.email;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && !user.name) {
        await prisma.user.update({
          where: { id: user.id },
          data: { name: user.email.split("@")[0] },
        });
      }
    },
  },
};

