"use client";   

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { set } from "zod";

export default function Dashboard() {

    const [user, setUser] = useState<User | null>(null);    
    const [status, setStatus] = useState<string | null>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [enrolled,setenrolled] = useState<any[]>([]);
    
    useEffect(() => {
    const getUserAndStatus = async () => {
        const { data } = await supabase.auth.getUser();
        const currentUser = data.user;
        setUser(currentUser);

        if (currentUser) {
            const { data: reqData ,error } = await supabase
                .from("instructor_requests")
                .select("status")
                .eq("user_id", currentUser.id)
                .single();
                    if(error){
                        console.log(error);
                        setStatus(null);
                        return;
                    }
                    console.log(reqData);
                    setStatus(reqData?.status || null); 
                    console.log(currentUser.id); 
                    
        }       
    };  
    getUserAndStatus();
 
}, []);
       console.log(status);     

    useEffect(() => {
        if(status == "pending"){
            console.log("Your instructor request is pending. Please wait for approval.");
        }
        else if(status == "APPROVED!"){
            console.log("Congratulations! Your instructor request has been approved.");
        }
    }, [status]);

    useEffect(() => {  
        const fetchCourses = async () => {
            const { data, error } = await supabase.from("courses").select("*");

            if( error )
            {
                alert("Failed to fetch courses: " + error.message);
            }
            else
            {
                setCourses(data);
            }
            console.log(data);
        };
        fetchCourses();
    }, []);    

    const handleEnrollment = async(courseId: string) => {
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
        }
        else {
            setenrolled([...enrolled, courseId]);
            alert("Successfully enrolled in course!");
        }

    }



    return (
        <div>
            <h1>Welcome to your Dashboard, {user?.user_metadata?.username}!</h1>
            {status === null && <Link href="/InsForm"><button className="border-rose-600 border-2">Apply to be a instructor!</button></Link>}
            {status === "pending" && <p>Your instructor request is pending. Please wait for approval.</p>}
            {status === "APPROVED!" && <Link href="/uploadCourse"><button>Upload course</button></Link>}
            <div className="grid grid-cols-3 gap-4">
            {courses.map((course) => (
                <div key={course.id} className="border p-3 rounded-xl hover:cursor-pointer" >
                <img src={course.thumbnail} className="w-full h-40 object-cover rounded-md" />
                <h2 className="font-bold mt-2">{course.courseName}</h2>
                <h4 className="text-lg font-semibold">{course.topics_covered}</h4>
                <h4 className="text-lg font-semibold">{course.description}</h4>
                <p>₹{course.price}</p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2" 
                onClick={() => handleEnrollment(course.id)}>Enroll</button>
                </div>
            ))}
            </div>
        </div>
    );
            

}