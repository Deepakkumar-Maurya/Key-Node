import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { acceptMessageSchema } from "@/schema/acceptMessageSchema";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "user Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    try {
        const userId = user._id;
        const { acceptMessages } = await request.json();

        const result = acceptMessageSchema.safeParse({ acceptMessages });
        if (!result.success) {
            const isAcceptingMessageErrors = result.error.format().acceptMessages?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: isAcceptingMessageErrors.length > 0 ? isAcceptingMessageErrors.join(", ") : "Invalid body params",
                },
                {
                    status: 400,
                }
            )
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            { _id: userId },
            { isAcceptingMessage: acceptMessages },
            { new: true }
        )
        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404,
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Status updated successfully",
                user: updatedUser
            },
            {
                status: 200,
            }
        )

    } catch (error) {
        console.log("Error in changing status of accepting messages", error);
        return Response.json(
            {
                success: false,
                message: "Error in changing status of accepting messages",
            },
            {
                status: 500,
            }
        )
    }

}

export async function GET() {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "user Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    try {
        const userId = user._id;
        const foundUser = await UserModel.findOne({ _id: userId });
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                {
                    status: 404,
                }
            )
        }

        return Response.json(
            {
                success: true,
                message: "Status fetched successfully",
                isAcceptingMessage: foundUser.isAcceptingMessage
            },
            {
                status: 200,
            }
        )
    } catch (error) {
        console.log("Error in fetching isAcceptingMessage status", error);
        return Response.json(
            {
                success: false,
                message: "Error in fetching isAcceptingMessage status",
            },
            {
                status: 500,
            }
        )
        
    }
}