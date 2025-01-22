import "next-auth";

declare module "next-auth" {
    interface User {
        _id?: string;
        username?: string;
        isVerified?: boolean;
        isAcceptingMessage?: boolean;
    }
    interface Session {
        user: {
            _id?: string;
            username?: string;
            isVerified?: boolean;
            isAcceptingMessage?: boolean;
        } & DefaultSession["user"];
    }

    interface JWT {
        _id?: string;
        username?: string;
        isVerified?: boolean;
        isAcceptingMessage?: boolean;
    }
}

// //** We can also declare in this way
// declare module "next-auth/jwt" {
//     interface JWT {
//         _id?: string;
//         username?: string;
//         isVerified?: boolean;
//         isAcceptingMessage?: boolean;
//     }
// }