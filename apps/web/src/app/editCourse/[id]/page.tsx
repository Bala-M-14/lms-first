"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

type Lesson = {
  id?: string;
  title: string;
  content: string;
  video_url?: string;
};

type Course = {
  id: string;
  courseName: string;
  description: string;
  topics_covered: string;
  price: string;
  thumbnail: string;
  ins_id: string;
};

export default function EditCourse() {
  const router = useRouter();
  const params = useParams();
  const courseId = String(params.id || "");

  const [user, setUser] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseContent, setCourseContent] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      fetchCourseData(data.user.id);
    };
    getUser();
  }, [router]);

  const fetchCourseData = async (userId: string) => {
    try {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      if (courseError) throw courseError;

      if (courseData.ins_id !== userId) {
        alert("No permission");
        router.push("/Ins_Dashboard");
        return;
      }

      setCourse(courseData);
      setCourseName(courseData.courseName);
      setCourseDescription(courseData.description);
      setCourseContent(courseData.topics_covered);
      setPrice(courseData.price);
      setThumbnailPreview(courseData.thumbnail);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to load course");
      router.push("/Ins_Dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLessonChange = (
    index: number,
    field: "title" | "content",
    value: string
  ) => {
    const updatedLessons = [...lessons];
    updatedLessons[index][field] = value;
    setLessons(updatedLessons);
  };

  const addLesson = () => {
    setLessons([...lessons, { title: "", content: "" }]);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !course) return;

    setUpdating(true);

    try {
      let thumbnailUrl = thumbnailPreview;

      if (thumbnailFile) {
        const filePath = `thumbnails/${user.id}/${Date.now()}-${thumbnailFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from("Thumbnail-bucket")
          .upload(filePath, thumbnailFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("Thumbnail-bucket")
          .getPublicUrl(filePath);

        thumbnailUrl = publicUrlData.publicUrl;
      }

      const { error: courseError } = await supabase
        .from("courses")
        .update({
          courseName,
          description: courseDescription,
          topics_covered: courseContent,
          price: Number(price),
          thumbnail: thumbnailUrl,
        })
        .eq("id", courseId);

      if (courseError) throw courseError;

      await supabase.from("lessons").delete().eq("course_id", courseId);

      const { error: insertError } = await supabase
        .from("lessons")
        .insert(
          lessons.map((lesson, index) => ({
            title: lesson.title,
            content: lesson.content,
            course_id: courseId,
            order_index: index,
            user_id: user.id,
            video_url: lesson.video_url || null,
          }))
        );

      if (insertError) throw insertError;

      alert("✅ Course updated!");
      router.push("/Ins_Dashboard");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update course");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF5F1] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-500 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F1]">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 py-3 md:py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tight">
            LMS<span className="text-[#FF7D44]">ZONE</span>
          </Link>
          <div className="flex items-center gap-3 md:gap-8 font-medium">
            <Link href="/Ins_Dashboard" className="text-sm md:text-base hover:text-[#FF7D44] transition">
              My Courses
            </Link>
            <button
              onClick={() => supabase.auth.signOut().then(() => router.push("/"))}
              className="text-xs md:text-sm font-bold text-red-500 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <Link href="/Ins_Dashboard" className="text-[#FF7D44] hover:text-[#ff6a2c] font-bold mb-6 inline-block transition text-sm md:text-base">
          ← Back
        </Link>

        <div className="bg-white rounded-[2rem] p-4 md:p-8 shadow-sm">
          <h1 className="text-2xl md:text-4xl font-black text-[#1A1A1A] mb-2">
            Edit Course
          </h1>
          <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">
            Update your course details
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="w-full px-4 md:px-5 py-2 md:py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 md:px-5 py-2 md:py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 text-sm md:text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Description
              </label>
              <textarea
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-4 md:px-5 py-2 md:py-3 rounded-2xl bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 resize-none text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Topics Covered
              </label>
              <textarea
                value={courseContent}
                onChange={(e) => setCourseContent(e.target.value)}
                required
                rows={2}
                className="w-full px-4 md:px-5 py-2 md:py-3 rounded-2xl bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 resize-none text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Thumbnail
              </label>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="flex-1 px-4 md:px-5 py-2 md:py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] text-sm file:bg-[#1EBBA3] file:text-white file:border-none file:px-3 file:py-1 file:rounded-full file:font-bold file:cursor-pointer"
                />
                {thumbnailPreview && (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden shadow-sm shrink-0">
                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 md:pt-8">
              <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-4 md:mb-6">Lessons</h3>

              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3 md:gap-0">
                      <h4 className="font-bold text-[#1A1A1A] text-sm md:text-base">Lesson {index + 1}</h4>
                      {lessons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLesson(index)}
                          className="text-red-500 hover:text-red-700 font-bold transition text-sm md:text-base w-full md:w-auto text-left md:text-right"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Lesson title"
                        value={lesson.title}
                        onChange={(e) =>
                          handleLessonChange(index, "title", e.target.value)
                        }
                        required
                        className="w-full px-4 md:px-5 py-2 md:py-3 rounded-full bg-white border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 text-sm md:text-base"
                      />

                      <textarea
                        placeholder="Lesson content"
                        value={lesson.content}
                        onChange={(e) =>
                          handleLessonChange(index, "content", e.target.value)
                        }
                        required
                        rows={3}
                        className="w-full px-4 md:px-5 py-2 md:py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 resize-none text-sm md:text-base"
                      />

                      {lesson.video_url && (
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                          <p className="text-xs md:text-sm text-blue-700 font-semibold truncate">
                            ✓ Video: {lesson.video_url.split("/").pop()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addLesson}
                className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-[#1A1A1A] px-6 py-2 md:py-3 rounded-full font-bold transition text-sm md:text-base"
              >
                + Add Lesson
              </button>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-[#1EBBA3] hover:bg-[#189a86] disabled:bg-gray-400 text-white px-6 py-3 md:py-4 rounded-full font-bold transition mt-6 md:mt-8 text-sm md:text-base"
            >
              {updating ? "Updating..." : "Update Course"}
            </button>
          </form>

          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-100 text-center">
            <Link href="/Ins_Dashboard" className="text-gray-500 hover:text-[#FF7D44] transition font-medium text-sm md:text-base">
              Back to My Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
