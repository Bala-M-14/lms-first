"use client";

import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

type Lesson = {
  id: string;
  title: string;
  content: string;
  course_id: string;
};

type Course = {
  id: string;
  courseName: string;
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();

  const lessonId = String(params.lessonId || "");
  const courseId = String(params.id || "");

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (data) setLesson(data);

      setLoading(false);
    };

    fetchLesson();
  }, [lessonId]);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      const { data } = await supabase
        .from("courses")
        .select("id, courseName")
        .eq("id", courseId)
        .single();

      if (data) setCourse(data);
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (user === undefined || !lessonId) return;

    if (!user) {
      setIsDone(false);
      return;
    }

    const fetchProgress = async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("completed")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .eq("course_id", courseId)
        .maybeSingle();

      setIsDone(!!data?.completed);
    };

    fetchProgress();
  }, [user, lessonId, courseId]);

  async function toggleComplete() {
    if (!user || marking) return;

    setMarking(true);

    const newValue = !isDone;
    setIsDone(newValue);

    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          completed: newValue,
        },
        {
          onConflict: "user_id,lesson_id",
        }
      );

    if (error) {
      setIsDone(!newValue);
    }

    setMarking(false);
  }

  if (!lessonId || lessonId.length < 10) {
    return (
      <div className="min-h-screen bg-[#FFF5F1] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold">Invalid lesson ID</p>
        </div>
      </div>
    );
  }

  if (loading || user === undefined) {
    return (
      <div className="min-h-screen bg-[#FFF5F1] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-500 text-lg">Loading lesson...</p>
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href={`/course/${courseId}`}
          className="text-[#FF7D44] hover:text-[#ff6a2c] font-bold mb-6 inline-block transition"
        >
          ← Back to Course
        </Link>

        <div className="bg-white rounded-[2rem] p-8 shadow-sm mb-8">
          <div className="mb-6">
            <p className="text-sm font-bold text-[#FF7D44] mb-2">
              {course?.courseName}
            </p>
            <h1 className="text-4xl font-black text-[#1A1A1A]">
              {lesson?.title}
            </h1>
          </div>

          <div className="w-full h-1 bg-linear-to-r from-[#1EBBA3] to-[#FF7D44] rounded-full mb-8" />

          <div className="prose prose-sm max-w-none mb-8">
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
              {lesson?.content}
            </div>
          </div>

          {user && (
            <div className="flex gap-4 pt-6 border-t border-gray-100">
              {isDone ? (
                <>
                  <button
                    onClick={toggleComplete}
                    disabled={marking}
                    className="flex-1 bg-green-100 hover:bg-green-200 disabled:bg-gray-300 text-green-700 font-bold py-4 px-6 rounded-full transition"
                  >
                    ✓ Lesson Completed
                  </button>
                  <button
                    onClick={toggleComplete}
                    disabled={marking}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-[#1A1A1A] font-bold py-4 px-6 rounded-full transition"
                  >
                    {marking ? "Saving..." : "Mark Incomplete"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={toggleComplete}
                    disabled={marking}
                    className="flex-1 bg-[#1EBBA3] hover:bg-[#189a86] disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-full transition"
                  >
                    {marking ? "Saving..." : "Mark as Complete"}
                  </button>
                  <Link
                    href={`/course/${courseId}`}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-[#1A1A1A] font-bold py-4 px-6 rounded-full transition text-center"
                  >
                    Continue Later
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}