import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { sendOtpMail } from "@/app/lib/mail";
import { getRecoveryError, getRecoveryUser, OTP_TTL_MS } from "../_recovery";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await getRecoveryUser(email);
    const recoveryError = getRecoveryError(user);

    if (recoveryError) {
      return NextResponse.json(
        { error: recoveryError.error },
        { status: recoveryError.status }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + OTP_TTL_MS);

    await prisma.user.update({
      where: { email },
      data: {
        otp,
        otpExpiry: otpExpiry,
      },
    });

    try {
      await sendOtpMail({ to: email, otp });
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError);
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
