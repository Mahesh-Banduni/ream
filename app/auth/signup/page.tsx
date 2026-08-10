import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Film, ArrowRight, CheckCircle2, User, Mail, Sparkles } from "lucide-react";
import { Metadata } from "next";
import GoogleButton from "@/components/auth/GoogleButton";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up | REAM — Automated Reel Generation Platform",
  description: "Real-time AI-powered short-form video content creation platform",
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export default function SignupPage() {
  const benefits = [
    "AI script writer with hook, body & tone controls",
    "12+ hyper-realistic voiceover styles & accents",
    "Automated image & visual asset curation",
    "Smart background music selection",
    "Full interactive timeline studio editor",
    "Instant 9:16 vertical video rendering"
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row font-sans">
      
      {/* Left Side - Visual / Value Prop */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-card items-center justify-center border-r border-border">
         {/* Abstract Background */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
         
         <div className="relative z-10 max-w-lg p-12">
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

            <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground mb-6">
              Start automating your short-form video creation today.
            </h2>
            
            <ul className="space-y-4 mb-12">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-base">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-border bg-background/50 p-6 backdrop-blur-sm">
               <div className="flex -space-x-2 mb-4">
                 {[1,2,3,4].map((i) => (
                   <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                     U{i}
                   </div>
                 ))}
               </div>
               <p className="text-sm text-muted-foreground italic">
                 Join 500+ creators and brands automating high-impact viral content on REAM.
               </p>
            </div>
         </div>
      </div>

      {/* Right Side - Form */}
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
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Get instant access to the ultimate automated reel generation platform.
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
              <span className="bg-background px-2 text-muted-foreground">Or register with email</span>
            </div>
          </div>

          <SignupForm />

          <p className="text-center text-xs text-muted-foreground">
            By clicking create account, you agree to our{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-primary">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-primary">Privacy Policy</Link>.
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}