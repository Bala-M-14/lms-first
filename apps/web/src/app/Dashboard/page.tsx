"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  courseName: string;
  description: string;
  price: number;
  thumbnail: string;
  topics_covered: string;
  created_at: string;
}

interface EnrolledCourse {
  course_id: string;
  user_id: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCount, setEnrolledCount] = useState(0);

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
          .single();

        setStatus(reqData?.status || null);
      } catch (error) {
      }
    };

    getUserAndStatus();
  }, [router]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from("courses").select("*");
        if (error) throw error;
        setCourses(data || []);
      } catch (error) {
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchEnrollment = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("Enrolled")
          .select("course_id")
          .eq("user_id", user.id);

        if (error) throw error;

        const enrolledIds = (data || []).map((e: any) => e.course_id);
        setEnrolled(enrolledIds);
        setEnrolledCount(enrolledIds.length);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, [user]);

  const handleEnrollment = async (courseId: string) => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    try {
      const { error } = await supabase.from("Enrolled").insert({
        user_id: user.id,
        course_id: courseId,
      });

      if (error) throw error;

      setEnrolled([...enrolled, courseId]);
      setEnrolledCount(enrolledCount + 1);
      alert("✅ Successfully enrolled in the course!");
    } catch (error) {
      alert("Failed to enroll in the course");
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/");
      alert("✅ Logged out successfully!");
    } catch (error) {
      alert("Failed to logout");
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
            <Link href="/" className="hover:text-[#FF7D44] transition">Home</Link>
            <Link href="/Enrollment" className="hover:text-[#FF7D44] transition">My Courses</Link>
            <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-black text-[#1A1A1A] mb-2">
              Hey, {user?.user_metadata?.username || "Learner"}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Let's continue learning and grow your skills
            </p>
          </div>
          <div className="flex gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <p className="text-sm text-gray-600 mb-2">Enrolled</p>
              <p className="text-4xl font-black text-[#1EBBA3]">{enrolledCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
              <p className="text-sm text-gray-600 mb-2">Available</p>
              <p className="text-4xl font-black text-[#FF7D44]">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          {status === null && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-[#FF7D44]">
              <h3 className="text-2xl font-bold mb-2">Want to teach?</h3>
              <p className="text-gray-600 mb-4">Apply to become an instructor and share your knowledge with thousands of learners</p>
              <Link href="/InsForm">
                <button className="bg-[#FF7D44] hover:bg-[#e56a2e] text-white px-8 py-3 rounded-full font-bold transition shadow-md">
                  Apply Now →
                </button>
              </Link>
            </div>
          )}

          {status === "pending" && (
            <div className="bg-yellow-50 rounded-2xl p-6 border-l-4 border-yellow-500">
              <h3 className="text-2xl font-bold text-yellow-900 mb-2">Application Pending ⏳</h3>
              <p className="text-yellow-800">We're reviewing your instructor application. This usually takes 2-3 business days.</p>
            </div>
          )}

          {status === "APPROVED!" && (
            <div className="bg-green-50 rounded-2xl p-6 border-l-4 border-green-500 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">Instructor Approved! 🎉</h3>
                <p className="text-green-800">You can now upload and manage your own courses</p>
              </div>
              <Link href="/uploadCourse">
                <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition shadow-md whitespace-nowrap">
                  Upload Course →
                </button>
              </Link>
            </div>
          )}
        </div>

        <div>
          <div className="mb-8">
            <span className="bg-[#FF7D44] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">All Courses</span>
            <h2 className="text-4xl font-black mt-4">Explore & Enroll</h2>
            <p className="text-gray-600 mt-2">Browse our complete catalog and start learning today</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin text-4xl">⏳</div>
              <p className="text-gray-400 mt-4">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No courses available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group">
                  <img className="aspect-video bg-[#FDF0E9] flex items-center justify-center text-6xl group-hover:scale-110 transition duration-300 overflow-hidden" src={course.thumbnail || "📚"} alt={course.courseName} />

                  <div className="p-6">
                    <h3 className="text-xl font-extrabold mb-2 line-clamp-2 text-[#1A1A1A]">
                      {course.courseName}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">
                      {course.description}
                    </p>

                    {course.topics_covered && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.topics_covered.split(",").slice(0, 2).map((topic, idx) => (
                          <span key={idx} className="bg-[#FDF0E9] text-[#FF7D44] text-xs px-3 py-1 rounded-full font-semibold">
                            {topic.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 gap-3">
                      <span className="text-2xl font-black text-[#FF7D44]">
                        ${course.price}
                      </span>
                      <div className="flex gap-2">
                        {enrolled.includes(course.id) ? (
                          <Link href={`/course/${course.id}`} className="flex-1">
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm transition">
                              Continue ✓
                            </button>
                          </Link>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEnrollment(course.id)}
                              className="flex-1 bg-[#1EBBA3] hover:bg-[#189a86] text-white px-4 py-2 rounded-full font-bold text-sm transition"
                            >
                              Enroll
                            </button>
                            <Link href={`/coursedetails/${course.id}`}>
                              <button className="bg-gray-100 hover:bg-gray-200 text-[#FF7D44] px-4 py-2 rounded-full font-bold text-sm transition">
                                Info
                              </button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-linear-to-b from-slate-900 to-black text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">&copy; 2026 LMSZONE. Keep learning, keep growing! 🚀</p>
        </div>
      </footer>
    </div>
  );
}
