"use client";   

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function Dashboard() {

    const [user, setUser] = useState<User | null>(null);    
    const [status, setStatus] = useState<string | null>(null);

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


    return (
        <div>
            <h1>Welcome to your Dashboard, {user?.user_metadata?.username}!</h1>
            {status === null && <Link href="/InsForm"><button className="border-rose-600 border-2">Apply to be a instructor!</button></Link>}
            {status === "pending" && <p>Your instructor request is pending. Please wait for approval.</p>}
            {status === "APPROVED!" && <Link href="/uploadCourse"><button>Upload course</button></Link>}
        </div>
    );
            

}