"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const userRouter = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        userRouter.push("/Dashboard");
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
            Welcome Back
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Sign in to continue your learning journey
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1EBBA3] hover:bg-[#189a86] disabled:bg-gray-400 text-white px-6 py-3 rounded-full font-bold transition mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#FF7D44] font-bold hover:text-[#e56a2e] transition">
                Sign Up
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