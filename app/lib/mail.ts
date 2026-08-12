import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com", // Default to Gmail SMTP
  port: parseInt(process.env.SMTP_PORT || "587", 10), // Default to port 587
  secure: process.env.SMTP_SECURE === "true", // Convert string to boolean
  auth: {
    user: process.env.SMTP_USER, // SMTP username (email)
    pass: process.env.SMTP_PASS, // SMTP password (app password for Gmail)
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function getMailFrom(partnerName?: string) {
  const from =
    process.env.SMTP_FROM || process.env.EMAIL_USER || process.env.SMTP_USER;

  if (!from) {
    throw new Error("SMTP sender is not configured.");
  }

  const displayName = partnerName || "REAM";
  return from.includes("<") ? from : `"${displayName}" <${from}>`;
}

export async function sendOtpMail({ to, otp }: { to: string; otp: number }) {
  await transporter.sendMail({
    from: getMailFrom(),
    to,
    subject: "Password Reset Verification Code - REAM",
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.5;max-width:760px;margin:0 auto;padding:24px;">
        <h2 style="font-size:22px;line-height:1.3;margin:0 0 16px;">
          Password Reset Request
        </h2>

        <p style="font-size:16px;margin:0 0 20px;">
          Dear user, we received a request to reset your password.
          Please use the verification code below to proceed:
        </p>

        <div
          style="background:#f9fafb;border:1px solid #d1d5db;border-radius:8px;padding:24px;text-align:center;margin:20px 0;"
        >
          <h1
            style="letter-spacing:6px;font-size:36px;line-height:1;margin:0;color:#111827;"
          >
            ${otp}
          </h1>
        </div>

        <p style="font-size:15px;margin:0 0 16px;">
          <strong>Note:</strong> This code will expire in 5 minutes for security reasons.
        </p>

        <p style="font-size:15px;margin:0 0 20px;">
          If you did not request a password reset, please ignore this email.
          Your account will remain secure.
        </p>

        <p style="font-size:15px;margin:0;">
          Best regards,<br/>
          <strong>REAM Team</strong>
        </p>
      </div>
    `,
  });
}