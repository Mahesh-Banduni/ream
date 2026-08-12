
import { Metadata } from "next";
import ForgotPasswordClient from "@/components/auth/ForgotPassword";

export const metadata: Metadata = {
  title: "Forgot Password | REAM",
  description: "Real-time AI-powered short-form video content creation platform",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export default function ForgotPasswordPage() {
    return(
        <ForgotPasswordClient />
    )
}