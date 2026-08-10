import React from "react";
import Link from "next/link";
import { Film, ArrowRight, User, Mail, Sparkles } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";
import GoogleButton from "@/components/auth/GoogleButton";
import SigninForm from "@/components/auth/SigninForm";

export const metadata: Metadata = {
  title: "Sign In | REAM — Automated Reel Generation Platform",
  description: "Real-time AI-powered short-form video content creation platform",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row font-sans">
      
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 bg-background relative z-10">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-2 font-heading text-xl font-bold tracking-tighter text-foreground">
            <a href="/" className="flex items-center justify-center relative h-[120px] w-[180px] px-5">
              <Image
                src="/images/logo.png"
                alt="REAM"
                fill
                className="object-contain p-1 w-full"
                priority
              />
            </a>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your AI video studio dashboard.
            </p>
          </div>

          <div className="grid gap-4">
            <GoogleButton />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <SigninForm />

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
              Create free account
            </Link>
          </p>
        </div>
        
        <div className="mt-12 text-center lg:text-left text-xs text-muted-foreground">
          © {new Date().getFullYear()} REAM Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Visual / Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-muted items-center justify-center">
        {/* Background Gradients matching global.css */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background opacity-50" />
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-md p-12 text-center">
            <div className="mb-8 flex items-center justify-center gap-2 font-heading text-xl font-bold tracking-tighter text-foreground">
              <a href="/" className="flex items-center justify-center relative h-[120px] w-[180px] px-5">
                <Image
                  src="/images/logo.png"
                  alt="REAM"
                  fill
                  className="object-contain p-1 w-full"
                  priority
                />
              </a>
            </div>

           <blockquote className="space-y-4">
             <p className="font-heading text-2xl font-bold leading-relaxed text-foreground">
               "REAM has completely transformed our short-form content production. What used to take hours of manual editing now takes 30 seconds."
             </p>
             <footer className="text-sm font-medium text-muted-foreground">
               — Alex Rivera, Head of Content at CreatorLab
             </footer>
           </blockquote>
        </div>
      </div>
    </div>
  );
}