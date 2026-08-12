import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    phone: string | null;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    phone: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and Password required");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            role: true,
          },
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.is_active) {
          throw new Error("User is inactive");
        }

        if (user.auth_provider !== "EMAIL") {
          throw new Error(
            "Please login using Google."
          );
        }

        if (!user.password_hash) {
          throw new Error("Password not set");
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!valid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.user_id,
          email: user.email,
          name: user.name,
          role: user.role.role_name,
          phone: user.phone,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const dbUser = await prisma.user.findUnique({
        where: {
          email: user.email!,
        },
        include: {
          role: true,
        },
      });

      if (dbUser) {
        if (!dbUser.is_active) return false;

        await prisma.user.update({
          where: {
            user_id: dbUser.user_id,
          },
          data: {
            google_id: account.providerAccountId,
            auth_provider: "GOOGLE",
          },
        });

        user.id = dbUser.user_id;
        user.role = dbUser.role.role_name;
        user.phone = dbUser.phone;

        return true;
      }

      const defaultRole = await prisma.role.findFirst({
        where: {
          role_name: "CLIENT",
        },
      });

      if (!defaultRole) {
        throw new Error("CLIENT role not found");
      }

      const created = await prisma.user.create({
        data: {
          name: user.name!,
          email: user.email!,
          phone: "",
          google_id: account.providerAccountId,
          auth_provider: "GOOGLE",
          role_id: defaultRole.role_id,
        },
        include: {
          role: true,
        },
      });

      user.id = created.user_id;
      user.role = created.role.role_name;
      user.phone = created.phone;

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: {
            email: token.email,
          },
          include: {
            role: true,
          },
        });

        if (!dbUser || !dbUser.is_active) {
          return {} as JWT;
        }

        token.id = dbUser.user_id;
        token.role = dbUser.role.role_name;
        token.phone = dbUser.phone;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.email) return session;

      session.user.id = token.id;
      session.user.role = token.role;
      session.user.phone = token.phone;

      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
