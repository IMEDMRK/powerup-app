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
        // DB Settings for Admin
        const settings = await prisma.settings.findUnique({ where: { id: "default" } });
        const adminUser = settings?.adminUsername || "Medpoweruo";
        const adminPassHash = settings?.adminPasswordHash;

        if (adminPassHash) {
          if (credentials?.username === adminUser && await bcrypt.compare(credentials?.password || "", adminPassHash)) {
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
        } else {
          const adminPass = process.env.DEFAULT_ADMIN_PASSWORD;
          if (adminPass && credentials?.username === adminUser && credentials?.password === adminPass) {
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
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
