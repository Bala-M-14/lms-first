"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InsForm() {
  const router = useRouter();
  const [expertise, setExpertise] = useState("");
  const [experience, setExperience] = useState("");
  const [reason, setReason] = useState("");
  const [portfolio_links, setPortfolioLinks] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUserAndStatus = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const currentUser = data.user;

        if (!currentUser) {
          router.push("/login");
          return;
        }

        setUser(currentUser);

        const { data: reqData } = await supabase
          .from("instructor_requests")
          .select("status")
          .eq("user_id", currentUser.id)
          .limit(1);

        if (reqData && reqData.length > 0) {
          setStatus(reqData[0].status);
        } else {
          setStatus(null);
        }
      } catch (error) {
      }
    };

    getUserAndStatus();
  }, [router]);

  const name = user?.user_metadata?.username;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;

      if (!currentUser) {
        alert("User not authenticated");
        return;
      }

      if (status) {
        alert("You already submitted a request");
        return;
      }

      const { error } = await supabase.from("instructor_requests").insert({
        user_id: currentUser.id,
        expertise,
        experience,
        reason,
        portfolio_links,
        status: "pending",
      });

      if (error) {
        alert("Error submitting request: " + error.message);
      } else {
        alert("✅ Request submitted successfully!");
        setStatus("pending");
        setExpertise("");
        setExperience("");
        setReason("");
        setPortfolioLinks("");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F1] font-sans text-[#2D2D2D]">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-[#1A1A1A] tracking-tight">
            LMS<span className="text-[#FF7D44]">ZONE</span>
          </Link>
          <div className="flex items-center gap-8 font-medium">
            <Link href="/Dashboard" className="hover:text-[#FF7D44] transition">
              Dashboard
            </Link>
            <button
              onClick={() => supabase.auth.signOut().then(() => router.push("/"))}
              className="text-sm font-bold text-red-500 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm">
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2">
            Become an Instructor
          </h1>
          <p className="text-gray-500 mb-8">
            Share your knowledge and inspire learners around the world
          </p>

          {status ? (
            <div className="bg-blue-50 border-l-4 border-[#1EBBA3] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                Application Status
              </h2>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#1EBBA3]"></div>
                <p className="text-lg font-semibold">
                  {status === "pending" && "Your application is under review"}
                  {status === "APPROVED!" && "✅ You're approved!"}
                </p>
              </div>
              {status === "APPROVED!" && (
                <Link href="/uploadCourse" className="mt-4 inline-block">
                  <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-bold transition">
                    Upload Your First Course →
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name || ""}
                    disabled
                    className="w-full px-5 py-3 rounded-full bg-gray-100 border-none text-[#1A1A1A] placeholder-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-5 py-3 rounded-full bg-gray-100 border-none text-[#1A1A1A] placeholder-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                  Area of Expertise
                </label>
                <input
                  type="text"
                  placeholder="e.g., Web Development, Data Science, UI Design"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  required
                  className="w-full px-5 py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                  Years of Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  className="w-full px-5 py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A]"
                >
                  <option value="">Select your experience level</option>
                  <option value="0-1">0–1 years</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3+">3+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                  Why do you want to teach?
                </label>
                <textarea
                  placeholder="Tell us about your passion for teaching and what courses you'd like to create..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-5 py-3 rounded-2xl bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                  Portfolio Links (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={portfolio_links}
                  onChange={(e) => setPortfolioLinks(e.target.value)}
                  className="w-full px-5 py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF7D44] hover:bg-[#e56a2e] disabled:bg-gray-400 text-white px-6 py-4 rounded-full font-bold transition mt-8"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>

              <p className="text-center text-gray-500 text-sm">
                We'll review your application and get back to you within 2-3 business days
              </p>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <Link href="/Dashboard" className="text-gray-500 hover:text-[#FF7D44] transition font-medium">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}