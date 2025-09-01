import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        id: { label: "ID", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const id = credentials?.id;

        if (!email || !id) {
          return null;
        }
        return {
          id: id,
          email: email,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth",
  },
};
