import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Mystery Message Verification Code",
            react: VerificationEmail({ username, otp: verifyCode }),
        });
        console.log("email sent successfully");

        return {
            success: true,
            message: "Verification email sent successfully",
        };
    } catch (error) {
        console.log("error in sendVerificationEmail", error);
        return {
            success: false,
            message: "Error sending verification email",
        };
    }
}
