import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifySchema } from "@/schema/verifySchema";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, code} = await request.json();

        const verificationCode = {
            code : code,
        }

        const result = verifySchema.safeParse(verificationCode);

        if (!result.success) {
            const codeErrors = result.error.format().code?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: codeErrors.length > 0 ? codeErrors.join(", ") : "Invalid code provided",
                },
                {
                    status: 400,
                }
            )
        }

        const user = await UserModel.findOne({
            username,
        });

        if (!user) {
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

        if (user.isVerified) {
            return Response.json(
                {
                    success: false,
                    message: "User already verified",
                },
                {
                    status: 400,
                }
            )
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = user.verifyCodeExpiry > new Date();

        if (!isCodeValid || !isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid code provided",
                },
                {
                    status: 400,
                }
            )
        }

        user.isVerified = true;
        await user.save();
        return Response.json(
            {
                success: true,
                message: "Code verified successfully",
            },
            {
                status: 200,
            }
        )
    } catch (error) {
        console.log("error in code verification", error);
        return Response.json(
            {
                success: false,
                message: "Error in code verification",
            },
            {
                status: 500,
            }
        );
    }
}
