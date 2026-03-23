"use client"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function Page() {

    const params = useParams()
    const [user, setUser] = useState<User | null>(null);    
    const [status, setStatus] = useState<string | null>(null);
    const [courses, setCourses] = useState<any>(null);


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

useEffect(() => {
        if(status == "pending"){
            console.log("Your instructor request is pending. Please wait for approval.");
        }
        else if(status == "APPROVED!"){
            console.log("Congratulations! Your instructor request has been approved.");
        }
    }, [status]);

useEffect(() => {
  if (!params.id) return;

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.log(error);
    } else {
      console.log(data);
      setCourses(data);
    }
  };

  fetchCourse();
}, [params.id]);

  return (
  <div>
    <h1>{courses?.courseName}</h1>
    <p>{courses?.description}</p>
  </div>
);
}