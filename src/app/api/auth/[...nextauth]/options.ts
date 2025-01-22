/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",

            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials?.identifier },
                            { username: credentials?.identifier }
                        ]
                    })

                    if (!user) {
                        throw new Error("User not found with this email");
                    }
                    if (!user.isVerified) {
                        throw new Error("Please verify your email before login");
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials?.password,
                        user.password
                    );
                    if (!isPasswordCorrect) {
                        throw new Error("Incorrect password");
                    }
                    return user
                } catch (error: any) {
                    throw new Error(error);
                }
            }
        }),
        // ... other providers
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.username = user.username;
                token.isVerified = user.isVerified;
                token.isAcceptingMessage = user.isAcceptingMessage;
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.username = token.username;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessage = token.isAcceptingMessage;
            }
            return session
        }
    },
    pages: {
        signIn: "/log-in"
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET
}