"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function Dashboard() {
const [user, setUser] = useState<User | null>(null);
const [status, setStatus] = useState<string | null>(null);
const [courses, setCourses] = useState<any[]>([]);
const [enrolled, setEnrolled] = useState<any[]>([]);

useEffect(() => {
const getUserAndStatus = async () => {
const { data } = await supabase.auth.getUser();
const currentUser = data.user;
setUser(currentUser);


  if (currentUser) {
    const { data: reqData, error } = await supabase
      .from("instructor_requests")
      .select("status")
      .eq("user_id", currentUser.id)
      .single();

    if (error) {
      console.log(error);
      setStatus(null);
      return;
    }

    setStatus(reqData?.status || null);
  }
};

getUserAndStatus();

}, []);

useEffect(() => {
const fetchCourses = async () => {
const { data, error } = await supabase.from("courses").select("*");

  if (error) {
    alert("Failed to fetch courses: " + error.message);
  } else {
    setCourses(data);
  }
};

fetchCourses();


}, []);

useEffect(() => {
const fetchEnrollment = async () => {
if (!user) return;

  const { data, error } = await supabase
    .from("Enrolled")
    .select("course_id")
    .eq("user_id", user.id);

  if (error) {
    alert("Cannot fetch Enrollment: " + error.message);
  } else {
    setEnrolled(data.map((e) => e.course_id));
  }
};

fetchEnrollment();

}, [user]);

const handleEnrollment = async (courseId: string) => {
const { data: userData } = await supabase.auth.getUser();
const currentUser = userData?.user;

if (!currentUser) {
  alert("User not authenticated");
  return;
}

const { error } = await supabase.from("Enrolled").insert({
  user_id: currentUser.id,
  course_id: courseId,
});

if (error) {
  alert("Failed to enroll in course: " + error.message);
} else {
  setEnrolled([...enrolled, courseId]);
  alert("Successfully enrolled!");
}


};

return ( <div> <h1>Welcome to your Dashboard, {user?.user_metadata?.username}!</h1>

  {status === null && (
    <Link href="/InsForm">
      <button className="border-2 border-rose-600">
        Apply to be an instructor
      </button>
    </Link>
  )}

  {status === "pending" && (
    <p>Your instructor request is pending. Please wait.</p>
  )}

  {status === "APPROVED!" && (
    <Link href="/uploadCourse">
      <button>Upload course</button>
    </Link>
  )}

  <div className="grid grid-cols-3 gap-4 mt-4">
    {courses.map((course) => (
      <div
        key={course.id}
        className="border p-3 rounded-xl shadow-sm"
      >
        <Link href={`/coursedetails/${course.id}`} className="block">
          <img
            src={course.thumbnail}
            className="w-full h-40 object-cover rounded-md"
          />
          <h2 className="font-bold mt-2">
            {course.courseName}
          </h2>
        </Link>

        <h4 className="text-sm">{course.topics_covered}</h4>
        <h4 className="text-sm">{course.description}</h4>
        <p className="font-semibold mt-1">₹{course.price}</p>

        {enrolled.includes(course.id) ? (
          <div className="flex gap-2 mt-2">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled
            >
              Enrolled ✓
            </button>

            <Link href={`/course/${course.id}`}>
              <button className="bg-purple-500 text-white px-4 py-2 rounded">
                Go to course
              </button>
            </Link>
          </div>
        ) : (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
            onClick={() => handleEnrollment(course.id)}
          >
            Enroll
          </button>
        )}
      </div>
    ))}
  </div>
</div>

);
}
