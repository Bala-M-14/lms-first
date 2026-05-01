"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  courseName: string;
  description: string;
  price: number;
  thumbnail: string;
  topics_covered: string;
  ins_id: string;
  created_at: string;
};

export default function InsDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      fetchInstructorCourses(data.user.id);
    };
    getUser();
  }, [router]);

  const fetchInstructorCourses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("ins_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Delete this course?")) return;

    setDeleting(courseId);
    try {
      await supabase.from("lessons").delete().eq("course_id", courseId);
      await supabase.from("courses").delete().eq("id", courseId);
      setCourses(courses.filter((c) => c.id !== courseId));
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete course");
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FFF5F1]">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 py-3 md:py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tight">
            LMS<span className="text-[#FF7D44]">ZONE</span>
          </Link>
          <div className="flex items-center gap-3 md:gap-8 font-medium">
            <Link href="/Dashboard" className="text-sm md:text-base hover:text-[#FF7D44] transition">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs md:text-sm font-bold text-red-500 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#1A1A1A] mb-2">
            My Courses
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-6 md:mb-8">
            Manage your uploaded courses
          </p>
          <Link href="/uploadCourse">
            <button className="bg-[#1EBBA3] hover:bg-[#189a86] text-white px-4 md:px-6 lg:px-8 py-2 md:py-3 rounded-full font-bold transition text-sm md:text-base">
              + Upload New Course
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-gray-400 mt-4 text-sm md:text-base">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-6 md:p-12 text-center shadow-sm">
            <p className="text-gray-500 text-base md:text-lg mb-6">No courses uploaded yet</p>
            <Link href="/uploadCourse">
              <button className="bg-[#FF7D44] hover:bg-[#ff6a2c] text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-bold transition text-sm md:text-base">
                Create Your First Course →
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <img
                  className="w-full aspect-video object-cover group-hover:scale-110 transition duration-300"
                  src={course.thumbnail || "https://placehold.co/600x340?text=📚"}
                  alt={course.courseName}
                />
                <div className="p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-extrabold mb-2 line-clamp-2 text-[#1A1A1A]">
                    {course.courseName}
                  </h3>
                  <p className="text-gray-500 text-xs md:text-sm mb-4 line-clamp-2 h-8 md:h-10">
                    {course.description}
                  </p>

                  {course.topics_covered && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.topics_covered
                        .split(",")
                        .slice(0, 2)
                        .map((topic, idx) => (
                          <span
                            key={idx}
                            className="bg-[#FDF0E9] text-[#FF7D44] text-xs px-2 md:px-3 py-1 rounded-full font-semibold"
                          >
                            {topic.trim()}
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t border-gray-100 gap-3">
                    <span className="text-xl md:text-2xl font-black text-[#FF7D44]">${course.price}</span>
                    <div className="flex gap-2">
                      <Link href={`/editCourse/${course.id}`} className="flex-1 sm:flex-none">
                        <button className="w-full bg-[#1EBBA3] hover:bg-[#189a86] text-white px-3 md:px-4 py-2 rounded-full font-bold text-xs md:text-sm transition">
                          ✏️ Edit
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        disabled={deleting === course.id}
                        className="bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-600 px-3 md:px-4 py-2 rounded-full font-bold text-xs md:text-sm transition"
                      >
                        {deleting === course.id ? "..." : "🗑️"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}