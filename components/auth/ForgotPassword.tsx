"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { toast } from "sooner";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Schemas ---
  const emailSchema = z.object({
    email: z
      .string()
      .trim()
      .nonempty("Email is required")
      .email("Please enter a valid email address"),
  });

  const otpSchema = z.object({
    otp: z
      .string()
      .trim()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  });

  const resetSchema = z
    .object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$/,
          "Must include uppercase, lowercase, number, and special character"
        ),
      confirmPassword: z.string().nonempty("Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  // --- Forms ---
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: { otp: "" },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    mode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  // --- Handlers ---
  const handleSendOtp = async (values: z.infer<typeof emailSchema>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEmail(values.email);
      toast.success("Verification code sent to your email");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values: z.infer<typeof otpSchema>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: values.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOtp(values.otp);
      toast.success("Identity verified");
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: z.infer<typeof resetSchema>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password: values.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Password reset successfully");
      router.push("/auth/signin");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // --- Dynamic Content based on Step ---
  const titles = {
    1: "Forgot your password?",
    2: "Check your email",
    3: "Set new password",
  };

  const descriptions = {
    1: "Enter your email address and we'll send you a verification code to reset your password.",
    2: `We've sent a 6-digit code to ${email}. Please enter it below to verify your identity.`,
    3: "Create a strong password to secure your AI video studio dashboard.",
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row font-sans">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 bg-background relative z-10">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-2 font-heading text-xl font-bold tracking-tighter text-foreground">
            <a href="/" className="flex items-center justify-center relative h-[120px] w-[180px] px-5">
              <Image src="/images/logo.png" alt="REAM" fill className="object-contain p-1 w-full" priority />
            </a>
          </div>

          {/* Header Text */}
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl transition-all duration-300">
              {titles[step as keyof typeof titles]}
            </h1>
            <p className="text-muted-foreground transition-all duration-300">
              {descriptions[step as keyof typeof descriptions]}
            </p>
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="grid gap-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="name@company.com" className="pl-10" {...field} />
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full h-11!">
                  {loading ? "Sending code..." : "Send verification code"}
                </Button>
              </form>
            </Form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="grid gap-4">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => {
                    const { onChange, ...rest } = field;
                    return (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000000"
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                            onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
                            {...rest}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <Button type="submit" disabled={loading} className="w-full h-11!">
                  {loading ? "Verifying..." : "Verify code"}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                  >
                    Change email address
                  </button>
                </div>
              </form>
            </Form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="grid gap-4">
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading} className="w-full h-11!">
                  {loading ? "Resetting..." : "Reset password"}
                </Button>
              </form>
            </Form>
          )}

          {/* Footer Links */}
          <div className="text-center text-sm text-muted-foreground">
            <Link
              href="/auth/signin"
              className="inline-flex items-center font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
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
              <Image src="/images/logo.png" alt="REAM" fill className="object-contain p-1 w-full" priority />
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