import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { Adapter } from "next-auth/adapters";
import { clearStaleTokens } from "./clearStaleTokensServerAction";
import { users, accounts, verificationToken } from "../db/schema"; // ✅ import specific tables
import { db } from "../db/db.config";
import { setName } from "./setNameServerAction";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    verificationTokensTable: verificationToken,
  }) as Adapter,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/success",
    error: "/auth/error",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      if (user) {
        const role = (user as { role?: string }).role || "user";
        await clearStaleTokens();
        return {
          ...token,
          id: user.id,
          role,
        };
      }

      if (trigger === "update" && session?.name !== token.name) {
        token.name = session.name;
        try {
          await setName(token.name!);
        } catch (error) {
          console.error("Failed to set user name:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        },
      };
    },
  },
});
