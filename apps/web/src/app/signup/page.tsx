"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const userRouter = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username } },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setSuccess("Signup successful! Redirecting to login...");
        setTimeout(() => userRouter.push("/login"), 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F1] font-sans text-[#2D2D2D] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <div className="text-3xl font-black text-[#1A1A1A] tracking-tight">
            LMS<span className="text-[#FF7D44]">ZONE</span>
          </div>
        </Link>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm">
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2 text-center">
            Get Started
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Create your account and start learning today
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-5 py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF7D44] hover:bg-[#e56a2e] disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-bold transition mt-6"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1EBBA3] font-bold hover:text-[#189a86] transition">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <Link href="/" className="text-gray-500 hover:text-[#FF7D44] transition text-sm font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}