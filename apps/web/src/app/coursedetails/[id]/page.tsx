"use client";

import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CourseDetails() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", params.id)
        .single();

      if (!error) setCourse(data);
    };

    fetchCourse();
  }, [params.id]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (!user || !params.id) return;

    const checkEnrollment = async () => {
      const { data } = await supabase
        .from("Enrolled")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", params.id)
        .single();

      if (data) setIsEnrolled(true);
    };

    checkEnrollment();
  }, [user, params.id]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("Enrolled").insert({
        user_id: user.id,
        course_id: params.id,
      });

      if (!error) {
        setIsEnrolled(true);
        alert("✅ Enrolled successfully!");
      } else {
        alert("Failed to enroll");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!course)
    return (
      <div className="min-h-screen bg-[#FFF5F1] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-500 text-lg">Loading course...</p>
        </div>
      </div>
    );

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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/Dashboard" className="text-[#FF7D44] hover:text-[#ff6a2c] font-bold mb-6 inline-block transition">
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm">
          {course.thumbnail && (
            <div className="w-full h-80 overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-4">
              {course.courseName}
            </h1>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="flex-1">
                <p className="text-gray-600 mb-2 text-sm">Course Price</p>
                <p className="text-3xl font-black text-[#1EBBA3]">
                  ${course.price}
                </p>
              </div>
              <div className="w-px h-12 bg-gray-100"></div>
              <div className="flex-1">
                <p className="text-gray-600 mb-2 text-sm">Status</p>
                <p className="font-bold text-lg">
                  {isEnrolled ? (
                    <span className="text-green-600">✓ Enrolled</span>
                  ) : (
                    <span className="text-gray-500">Not Enrolled</span>
                  )}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">
                Course Description
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {course.description}
              </p>
            </div>

            {course.topics_covered && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">
                  Topics Covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {course.topics_covered.split(",").map((topic: string, index: number) => (
                    <span
                      key={index}
                      className="bg-[#FDF0E9] text-[#1A1A1A] px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {topic.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
                What You'll Learn
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-[#1EBBA3] font-bold mt-1">✓</span>
                  <span className="text-gray-600">In-depth knowledge from industry experts</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1EBBA3] font-bold mt-1">✓</span>
                  <span className="text-gray-600">Hands-on projects and real-world applications</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1EBBA3] font-bold mt-1">✓</span>
                  <span className="text-gray-600">Lifetime access to course materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#1EBBA3] font-bold mt-1">✓</span>
                  <span className="text-gray-600">Certificate of completion</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              {isEnrolled ? (
                <>
                  <button
                    disabled
                    className="flex-1 bg-green-100 text-green-700 px-6 py-4 rounded-full font-bold transition cursor-default"
                  >
                    ✓ Already Enrolled
                  </button>
                  <Link
                    href={`/course/${course.id}`}
                    className="flex-1 bg-[#1EBBA3] hover:bg-[#189a86] text-white px-6 py-4 rounded-full font-bold transition text-center"
                  >
                    Start Learning
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={loading}
                  className="w-full bg-[#FF7D44] hover:bg-[#e56a2e] disabled:bg-gray-400 text-white px-6 py-4 rounded-full font-bold transition"
                >
                  {loading ? "Enrolling..." : "Enroll Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
