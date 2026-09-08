import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name || undefined };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) token.id = (user as any).id;
      // Refresh plan on every request so an upgrade takes effect without re-login.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        token.plan = dbUser?.plan ?? "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan ?? "free";
      }
      return session;
    }
  }
};

// Helper used by API routes / server components to check the caller's plan.
export async function getUserWithPlan(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}
