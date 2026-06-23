import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Hardcoded Master Admin
        const adminUser = "Medpoweruo";
        const adminPass = "Powerup123";

        if (credentials?.username === adminUser && credentials?.password === adminPass) {
          return { 
            id: "master", 
            name: "Master Admin", 
            email: "admin@powerup.dz",
            role: "ADMIN",
            permissions: {
              canViewStats: true,
              canManageDelivery: true,
              canManagePages: true,
              canManageSettings: true
            }
          };
        }

        if (!credentials?.username || !credentials?.password) return null;

        // DB User
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });

        if (!user || !user.isActive) return null;

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          permissions: user.permissions || {
             canViewStats: false,
             canManageDelivery: false,
             canManagePages: false,
             canManageSettings: false
          }
        } as any;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "1b83d8a5c3e7f2b1d0a9e8c7f6b5a4d3e2c1f0a9b8c7d6e5f4a3b2c1d0e9f8a7",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
