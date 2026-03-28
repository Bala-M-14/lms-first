"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function Enrollment() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      setUser(currentUser);

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const { data: enrolledData, error } = await supabase
        .from("Enrolled")
        .select("courses(*)")
        .eq("user_id", currentUser.id);

      if (error) {
        alert("Cannot fetch enrolled courses: " + error.message);
      } else {
        setUserCourses(enrolledData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F1] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-500 text-lg">Loading your courses...</p>
        </div>
      </div>
    );
  }

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
              onClick={() =>
                supabase.auth.signOut().then(() => router.push("/"))
              }
              className="text-sm font-bold text-red-500 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2">
            My Enrolled Courses
          </h1>
          <p className="text-gray-600 text-lg">
            Continue learning where you left off
          </p>
        </div>

        {userCourses.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              No Enrolled Courses Yet
            </h2>
            <p className="text-gray-600 mb-8">
              Start your learning journey by enrolling in a course
            </p>
            <Link
              href="/Dashboard"
              className="inline-block bg-[#1EBBA3] hover:bg-[#189a86] text-white font-bold px-8 py-4 rounded-full transition"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCourses.map((item) => (
              <Link
                key={item.courses.id}
                href={`/coursedetails/${item.courses.id}`}
              >
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={item.courses.thumbnail}
                      alt={item.courses.courseName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-black text-[#1A1A1A] mb-2 group-hover:text-[#1EBBA3] transition">
                      {item.courses.courseName}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 flex-1">
                      {item.courses.description}
                    </p>

                    <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Price</p>
                        <p className="text-2xl font-black text-[#1EBBA3]">
                          ${item.courses.price}
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-[#FDF0E9] rounded-full flex items-center justify-center group-hover:bg-[#1EBBA3] transition">
                        <span className="text-[#1EBBA3] group-hover:text-white font-bold text-lg">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/Dashboard" className="text-gray-500 hover:text-[#FF7D44] transition font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}