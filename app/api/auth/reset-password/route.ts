import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { getRecoveryError, getRecoveryUser, isOtpExpired, normalizeOtp } from "../_recovery";

export async function POST(req: Request) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ error: "Email, OTP and password are required" }, { status: 400 });
    }

    const user = await getRecoveryUser(email);
    const recoveryError = getRecoveryError(user);

    if (recoveryError) {
      return NextResponse.json(
        { error: recoveryError.error },
        { status: recoveryError.status }
      );
    }

    if (!user?.otp || !user.otpExpiry) {
      return NextResponse.json({ error: "Invalid reset session" }, { status: 400 });
    }

    const normalizedOtp = normalizeOtp(otp);

    if (!Number.isInteger(normalizedOtp)) {
      return NextResponse.json({ error: "OTP must contain only numbers" }, { status: 400 });
    }

    if (user.otp !== normalizedOtp) {
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 });
    }

    if (isOtpExpired(user.otpExpiry)) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    const passwordValidation =
      password.length >= 8 &&
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$/.test(password);

    if (!passwordValidation) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: {
        password_hash: hashedPassword,
        otp: null,
        otpExpiry: null,
      },
    });

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
