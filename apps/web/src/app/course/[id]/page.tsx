"use client";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

type Course = {
  id: string;
  courseName: string;
  description: string;
};

type Lesson = {
  id: string;
  title: string;
  content: string;
  course_id: string;
};

type LessonProgress = {
  lesson_id: string;
  completed: boolean;
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndStatus = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user;
      setUser(currentUser);

      if (currentUser) {
        const { data: reqData } = await supabase
          .from("instructor_requests")
          .select("status")
          .eq("user_id", currentUser.id)
          .single();

        setStatus(reqData?.status || null);
      }
    };

    getUserAndStatus();
  }, []);

  useEffect(() => {
    if (!params.id || !user) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", params.id)
        .single();

      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", params.id)
        .order("created_at", { ascending: true });

      if (courseData) setCourse(courseData);
      if (lessonsData) setLessons(lessonsData || []);

      if (lessonsData && lessonsData.length > 0) {
        const { data: progressData } = await supabase
          .from("lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)
          .eq("course_id", params.id);

        if (progressData) {
          const progressMap: Record<string, boolean> = {};
          progressData.forEach((p: LessonProgress) => {
            progressMap[p.lesson_id] = p.completed;
          });
          setProgress(progressMap);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [params.id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F1] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-500 text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  const completedLessons = Object.values(progress).filter(Boolean).length;
  const totalLessons = lessons.length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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

        <div className="bg-white rounded-[2rem] p-8 shadow-sm mb-8">
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-3">
            {course?.courseName}
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            {course?.description}
          </p>

          {user && totalLessons > 0 && (
            <div className="bg-linear-to-r from-[#FDF0E9] to-[#f5e6dc] rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-bold text-[#1A1A1A]">
                  Your Progress
                </p>
                <span className="text-2xl font-black text-[#1EBBA3]">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-sm">
                <div
                  className="h-full bg-linear-to-r from-[#1EBBA3] to-[#FF7D44] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-3">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm">
          <h2 className="text-2xl font-black text-[#1A1A1A] mb-6">
            Course Lessons
          </h2>

          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No lessons available yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => {
                const isCompleted = progress[lesson.id] || false;
                return (
                  <Link
                    key={lesson.id}
                    href={`/course/${params.id}/lesson/${lesson.id}`}
                  >
                    <div
                      className={`p-5 rounded-2xl transition-all cursor-pointer border-2 ${
                        isCompleted
                          ? "bg-green-50 border-green-200 hover:border-green-300"
                          : "bg-linear-to-r from-[#FDF0E9] to-white border-[#FDF0E9] hover:border-[#1EBBA3]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#FF7D44] mb-1">
                            Lesson {index + 1}
                          </p>
                          <h3 className="text-lg font-bold text-[#1A1A1A]">
                            {lesson.title}
                          </h3>
                        </div>
                        {isCompleted && (
                          <div className="ml-4 shrink-0">
                            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                              <span className="text-green-700 font-black text-lg">✓</span>
                            </div>
                          </div>
                        )}
                        {!isCompleted && (
                          <div className="ml-4 shrink-0">
                            <div className="w-10 h-10 bg-[#FDF0E9] rounded-full flex items-center justify-center">
                              <span className="text-[#1EBBA3] font-bold">→</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/Dashboard" className="text-gray-500 hover:text-[#FF7D44] transition font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}