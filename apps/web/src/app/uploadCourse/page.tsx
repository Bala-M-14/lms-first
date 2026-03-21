"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect, } from "react";
import { User } from "@supabase/supabase-js";
import { th } from "zod/locales";

export default function UploadCourse() {

    const [user, setUser] = useState<User | null>(null);
    const [courseName, setCourseName] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [courseContent, setCourseContent] = useState("");
    const [price, setPrice] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data.user;
            setUser(currentUser);
            console.log(currentUser);
        };
        getUser();
    }, []);

    const handleSubmit = async () => {

        if(!thumbnailFile) {
            alert("Please select a thumbnail image for the course.");
            return;
        }
        if (!user) {
            alert("User not authenticated");
            return;
        }
        const filePath = `thumbnails/${user.id}/${Date.now()}-${thumbnailFile.name}`;

        const {error : uploadError} = await supabase.storage.from("Thumbnail-bucket").upload(filePath, thumbnailFile);
        if(uploadError) {
            alert("Failed to upload thumbnail. Please try again:" + uploadError.message);
        }
        const { data: publicUrlData } = supabase.storage
            .from("Thumbnail-bucket")
            .getPublicUrl(filePath);

        const thumbnailUrl = publicUrlData.publicUrl;

        if (!thumbnailFile.type.startsWith("image/")) 
            {
                alert("Only image files allowed");
                return;
            }   

        const { error } = await supabase.from("courses").insert([
        {
            courseName,
            description: courseDescription,
            topics_covered: courseContent,
            thumbnail : thumbnailUrl,
            price: Number(price),
        }
        ]);
        if (error) {
            alert("Failed to upload course. Please try again:" + error.message);
        }
        else {
            alert("Course uploaded successfully!");
            setCourseName("");
            setCourseDescription("");
            setCourseContent("");
            
            setPrice("");
        }

    };

    return (
        <div>
            <h1>Upload Course Page</h1>
            <p>This is where instructors can upload their courses.</p>
            <input
                type="text"
                placeholder="Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Course Description"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
            />
            <input
                type="text"
                placeholder="Course Content"
                value={courseContent}
                onChange={(e) => setCourseContent(e.target.value)}
            />
            <input
                type="file"
                placeholder="Thumbnail"
                onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setThumbnailFile(e.target.files[0]);
                                }
                                }}
            />
            <input
                type="text"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />
            <button onClick={handleSubmit}>Submit Course</button>
        </div>
    );
}