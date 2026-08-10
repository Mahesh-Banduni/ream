import prisma from "@/app/lib/prisma";

export const OTP_TTL_MS = 5 * 60 * 1000;

export type RecoveryUser = {
  is_active: boolean;
  auth_provider: "EMAIL" | "GOOGLE";
  password_hash: string | null;
  otp: number | null;
  otpExpiry: Date | null;
  role: {
    role_name: string;
  } | null;
};

export async function getRecoveryUser(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      is_active: true,
      auth_provider: true,
      password_hash: true,
      otp: true,
      otpExpiry: true,
      role: {
        select: {
          role_name: true,
        },
      },
    },
  }) as Promise<RecoveryUser | null>;
}

export function getRecoveryError(user: RecoveryUser | null) {
  if (!user) {
    return { error: "User not found with this email.", status: 404 };
  }

  if (user.role?.role_name === "FUNERAL_HOME") {
    return {
      error: "Password recovery is not available for this account.",
      status: 403,
    };
  }

  if (user.auth_provider !== "EMAIL") {
    return {
      error: "Please login using Google.",
      status: 400,
    };
  }

  if (!user.password_hash) {
    return {
      error: "Password is not set for this account.",
      status: 400,
    };
  }

  if (!user.is_active) {
    return {
      error: "Please contact administrator to activate your account.",
      status: 400,
    };
  }

  return null;
}

export function normalizeOtp(otp: string | number) {
  return typeof otp === "number" ? otp : parseInt(otp, 10);
}

export function isOtpExpired(otpExpiry: Date | null) {
  return !otpExpiry || new Date() > otpExpiry;
}
