"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function Enrollment() {

const [user, setUser] = useState<User | null>(null);  
const [userCourses,setUserCourses] = useState<any[]>([]);

useEffect(() => {
    const fetchData = async () => {
        const { data } = await supabase.auth.getUser();
        const currentUser = data.user;
        setUser(currentUser);

        if (!currentUser) return;

        const { data: enrolledData, error } = await supabase
            .from("Enrolled")
            .select("courses(*)")
            .eq("user_id", currentUser.id);

        if (error) {
            alert("Cannot fetch enrolled courses: " + error.message);
        } else {
            setUserCourses(enrolledData);
        }
    };

    fetchData();
}, []);

    return (
        <div>
            <h1>Enrollment Page</h1>
            <p>This is where students can enroll in courses.</p>
        <Link href="/CourseDetails">
        <div className="grid grid-cols-3 gap-4">
            {userCourses.map((item) => (
                <div key={item.courses.id} className="border p-3 rounded-xl">
                    <img src={item.courses.thumbnail} className="w-full h-40 object-cover rounded-md" />
                    <h2 className="font-bold mt-2">{item.courses.courseName}</h2>
                    <p>₹{item.courses.price}</p>
                </div>
            ))}
        </div>
        </Link>
        </div>
    );
}