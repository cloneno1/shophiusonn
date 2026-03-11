import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        await connectDB();
        const user = await User.findOne({ username: credentials.username });
        
        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          // Tạo mã giới thiệu nếu chưa có (cho các tài khoản cũ)
          if (!user.affiliateCode) {
            user.affiliateCode = Math.random().toString(36).substring(2, 10).toUpperCase();
            await user.save();
          }

          return { 
            id: user._id.toString(), 
            name: user.username, 
            balance: user.balance,
            affiliateBalance: user.affiliateBalance || 0,
            totalAffiliateEarnings: user.totalAffiliateEarnings || 0,
            affiliateCode: user.affiliateCode,
            role: user.role
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.balance = user.balance;
        token.affiliateBalance = user.affiliateBalance;
        token.totalAffiliateEarnings = user.totalAffiliateEarnings;
        token.affiliateCode = user.affiliateCode;
        token.role = user.role;
      }
      if (trigger === "update" && session?.balance !== undefined) {
        token.balance = session.balance;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.balance = token.balance;
      session.user.affiliateBalance = token.affiliateBalance;
      session.user.totalAffiliateEarnings = token.totalAffiliateEarnings;
      session.user.affiliateCode = token.affiliateCode;
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
