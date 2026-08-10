"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  id,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
}) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="text-sm font-medium text-foreground"
    >
      {label}
    </label>

    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  </div>
);

export default function SignupForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (login?.error) {
        setError(login.error);
      } else {
        router.push("/client/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Input
        id="name"
        label="Full Name"
        placeholder="John Doe"
        value={name}
        onChange={setName}
      />

      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="john@example.com"
        value={email}
        onChange={setEmail}
      />

      <Input
        id="phone"
        label="Phone"
        placeholder="+91 9876543210"
        value={phone}
        onChange={setPhone}
      />

      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="Create a strong password"
        value={password}
        onChange={setPassword}
      />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Account"}

        {!loading && (
          <ArrowRight className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}