import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

import CredentialsProvider from "next-auth/providers/credentials";

import db from "../../../utils/db";
import User from "../../../models/User";
import bcrypt from "bcrypt";

db.connectDb();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      async authorize(credentials, req) {
        try {
          const email  = credentials.email;
          const password = credentials.password;
          const user = await User.findOne({ email })
          if (user) {
            const result = await signInUser({ password, user });
            return result;
          } else {
            return null;
          }
        } catch (e) {
          return null;
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) {
        return false;
      }

      if (account?.provider === "credentials") {
        return true;
      }

      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const newUser = new User({
          name: user.name || user.email,
          email: user.email,
          image: user.image || "https://i.im.ge/2023/04/25/Lg2cWX.user-image-default.jpg",
          emailVerified: true,
          role: "user",
          password: "",
          address: [],
          whishlist: [],
          defaultPaymentMethod: "",
        });
        await newUser.save();
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.sub = dbUser._id;
          token.role = dbUser.role || "user";
        }
      }
      return token;
    },
    async session({ session, token }) {
      let user = await User.findById(token.sub);
      session.user.id = user?._id || token.sub;
      session.user.role = user?.role || token.role || "user";
      session.user.name = user?.name || session.user.name;
      session.user.image = user?.image || session.user.image;
      return session; 
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.JWT_SECRET,
}

export default NextAuth(authOptions);

export const signInUser = async ({ password, user }) => {
  if(!password) {
    throw new Error("Please enter your password.")
  }
  const testPassword = await bcrypt.compare(password, user.password)
  if(!testPassword) {
    throw new Error("Email or Password is Wrong!")
  } else {
    return user;
  }
}
