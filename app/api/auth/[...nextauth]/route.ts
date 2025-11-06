import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // In a production environment, you would validate credentials against a database
        // For demonstration purposes, we'll accept any email/password combination
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TODO: Replace with actual user validation from database
        // const user = await prisma.user.findUnique({
        //   where: { email: credentials.email }
        // });
        // if (!user || !await bcrypt.compare(credentials.password, user.password)) {
        //   return null;
        // }

        // For now, return a mock user
        return {
          id: "1",
          email: credentials.email,
          name: credentials.email.split("@")[0],
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
