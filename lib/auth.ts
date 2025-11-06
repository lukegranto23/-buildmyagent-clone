import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import nodemailer from "nodemailer";

import { prisma } from "./prisma";

const emailFrom = process.env.EMAIL_FROM ?? "no-reply@example.com";

function resolveEmailTransport() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  if (host && port && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }

  if (process.env.NODE_ENV !== "production") {
    return nodemailer.createTransport({
      streamTransport: true,
      newline: "lf",
      buffer: true,
    });
  }

  console.warn("Email provider is not fully configured. Set EMAIL_SERVER_* variables to send magic links.");
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "lf",
    buffer: true,
  });
}

const transport = resolveEmailTransport();

function emailHtml(url: string, host: string) {
  return `
  <body style="background: #f9fafb; padding: 32px 0; font-family: Arial, sans-serif; color: #111827;">
    <table width="100%" role="presentation" cellspacing="0" cellpadding="0" style="max-width: 512px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
      <tr>
        <td style="padding: 32px;">
          <h1 style="margin: 0 0 18px; font-size: 24px; font-weight: 700;">Sign in to ${host}</h1>
          <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">Click the button below to verify your email address and finish signing in.</p>
          <a href="${url}" style="display: inline-block; padding: 12px 20px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify email</a>
          <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.6; color: #6b7280;">If you did not request this email you can safely ignore it.</p>
        </td>
      </tr>
    </table>
  </body>
  `;
}

function emailText(url: string, host: string) {
  return `Sign in to ${host}\n${url}\n\nIf you did not request this email you can ignore it.`;
}

const providers = [
  EmailProvider({
    from: emailFrom,
    maxAge: 24 * 60 * 60,
    sendVerificationRequest: async ({ identifier, url, provider }) => {
      const { host } = new URL(url);

      const result = await transport.sendMail({
        to: identifier,
        from: provider.from ?? emailFrom,
        subject: `Sign in to ${host}`,
        text: emailText(url, host),
        html: emailHtml(url, host),
      });

      if (process.env.NODE_ENV !== "production") {
        const preview = result?.message?.toString();
        if (preview) {
          console.info(`Sent email sign-in link to ${identifier}:\n${preview}`);
        }
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers,
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export type AuthOptions = typeof authOptions;
