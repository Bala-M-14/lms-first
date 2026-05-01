"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { courseSchema, lessonSchema } from "@repo/schemas";

export default function UploadCourse() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseContent, setCourseContent] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [lessons, setLessons] = useState([{ title: "", content: "" }]);
  const [loading, setLoading] = useState(false);
  const [videoFiles, setVideoFiles] = useState<(File | null)[]>([null]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
      } catch (error) {
      }
    };
    getUser();
  }, [router]);

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

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const updatedVideos = [...videoFiles];
      updatedVideos[index] = file;
      setVideoFiles(updatedVideos);
    } 
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        alert("User not authenticated");
        return;
      }

      const courseData = {
        courseName,
        description: courseDescription,
        topics_covered: courseContent,
        thumbnail: "https://temp.com",
        price: Number(price),
      };

      const courseResult = courseSchema.safeParse(courseData);

      if (!courseResult.success) {
        alert("Invalid course data");
        return;
      }

      if (!thumbnailFile) {
        alert("Please select a thumbnail image.");
        return;
      }

      if (!thumbnailFile.type.startsWith("image/")) {
        alert("Only image files allowed");
        return;
      }

      const filePath = `thumbnails/${user.id}/${Date.now()}-${thumbnailFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("Thumbnail-bucket")
        .upload(filePath, thumbnailFile);


      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("Thumbnail-bucket")
        .getPublicUrl(filePath);

      const thumbnailUrl = publicUrlData.publicUrl;

      const videoUrls: (string | null)[] = [];
      
      for (let i = 0; i < videoFiles.length; i++) {
          if (!videoFiles[i]) {
            videoUrls.push(null);
            continue;
          }

          const path = `videos/${user.id}/${Date.now()}-${i}.mp4`;
          const { error: videoUploadError } = await supabase.storage
            .from("Lesson videos")
            .upload(path, videoFiles[i] as File);

          const { data } = supabase.storage
            .from("Lesson videos")
            .getPublicUrl(path);

          const videoUrl = data.publicUrl;
          
          if (videoUploadError) {
            alert("Video upload failed: " + videoUploadError.message);
            return;
          }
          
          const { data: videoUrlData } = supabase.storage
            .from("Lesson videos")
            .getPublicUrl(path);
          
          videoUrls.push(videoUrlData.publicUrl);
        }

      const { data, error } = await supabase
        .from("courses")
        .insert([
          {
            courseName,
            description: courseDescription,
            topics_covered: courseContent,
            thumbnail: thumbnailUrl,
            price: Number(price),
            ins_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        alert(error.message);
        return;
      }

      const courseId = data.id;

      for (let i = 0; i < lessons.length; i++) {
        const lessonData = {
          title: lessons[i].title,
          content: lessons[i].content,
          order_index: i,
          course_id: "00000000-0000-0000-0000-000000000000",
        };

        const result = lessonSchema.safeParse(lessonData);

        if (!result.success) {
          alert(`Lesson ${i + 1} is invalid`);
          return;
        }
      }

      const { error: lessonError } = await supabase
        .from("lessons")
        .insert(
          lessons.map((lesson, index) => ({
            title: lesson.title,
            content: lesson.content,
            course_id: courseId,
            order_index: index,
            user_id: user.id,
            video_url: videoUrls[index] || null,
          }))
        );

      if (lessonError) {
        alert("Lessons failed to save: " + lessonError.message);
        return;
      }

      alert("✅ Course uploaded successfully!");

      setCourseName("");
      setCourseDescription("");
      setCourseContent("");
      setPrice("");
      setThumbnailFile(null);
      setThumbnailPreview("");
      setLessons([{ title: "", content: "" }]);
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  type Lesson = {
    title: string;
    content: string;
    video_url?: string;
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
    setVideoFiles([...videoFiles, null]);
  };

  const removeLesson = (index: number) => {
    const updated = lessons.filter((_, i) => i !== index);
    const updatedVideos = videoFiles.filter((_, i) => i !== index);
    setLessons(updated);
    setVideoFiles(updatedVideos);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F1] font-sans text-[#2D2D2D]">
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
              onClick={() => supabase.auth.signOut().then(() => router.push("/"))}
              className="text-xs md:text-sm font-bold text-red-500 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="bg-white rounded-[2rem] p-4 md:p-8 shadow-sm">
          <h1 className="text-2xl md:text-4xl font-black text-[#1A1A1A] mb-2">
            Upload Your Course
          </h1>
          <p className="text-sm md:text-base text-gray-500 mb-6 md:mb-8">
            Create and publish your first course to start earning
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Advanced Web Development"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="w-full px-5 py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  placeholder="99.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-5 py-3 rounded-full bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Course Description
              </label>
              <textarea
                placeholder="Describe what students will learn in this course..."
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-5 py-3 rounded-2xl bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Topics Covered
              </label>
              <textarea
                placeholder="e.g., HTML, CSS, JavaScript, React (comma separated)"
                value={courseContent}
                onChange={(e) => setCourseContent(e.target.value)}
                required
                rows={2}
                className="w-full px-5 py-3 rounded-2xl bg-[#FDF0E9] border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1A1A1A] mb-2">
                Course Thumbnail
              </label>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  required
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
                        placeholder="Lesson content/description"
                        value={lesson.content}
                        onChange={(e) =>
                          handleLessonChange(index, "content", e.target.value)
                        }
                        required
                        rows={3}
                        className="w-full px-4 md:px-5 py-2 md:py-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#1EBBA3] outline-none text-[#1A1A1A] placeholder-gray-400 resize-none text-sm md:text-base"
                      />
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-2">Video Upload (Optional)</label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleVideoUpload(e, index)}
                          className="w-full px-4 md:px-5 py-2 md:py-3 rounded-full bg-white border-2 border-gray-200 focus:border-[#1EBBA3] text-[#1A1A1A] text-sm cursor-pointer file:bg-[#1EBBA3] file:text-white file:border-none file:px-3 file:py-1 file:rounded-full file:font-bold file:cursor-pointer"
                        />
                        {videoFiles[index] && (
                          <p className="text-xs md:text-sm text-green-600 font-bold mt-2 truncate">✓ Video selected: {videoFiles[index]?.name}</p>
                        )}
                      </div>
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
              disabled={loading}
              className="w-full bg-[#1EBBA3] hover:bg-[#189a86] disabled:bg-gray-400 text-white px-6 py-3 md:py-4 rounded-full font-bold transition mt-6 md:mt-8 text-sm md:text-base"
            >
              {loading ? "Publishing Course..." : "Publish Course"}
            </button>
          </form>

          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-100 text-center">
            <Link href="/Dashboard" className="text-gray-500 hover:text-[#FF7D44] transition font-medium text-sm md:text-base">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}