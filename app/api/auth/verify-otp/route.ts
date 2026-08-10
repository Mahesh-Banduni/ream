import { NextResponse } from "next/server";
import { getRecoveryError, getRecoveryUser, isOtpExpired, normalizeOtp } from "../_recovery";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
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
      return NextResponse.json({ error: "Invalid OTP request or expired session" }, { status: 400 });
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

    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
