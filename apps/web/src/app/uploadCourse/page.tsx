"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function UploadCourse() {
    const [user, setUser] = useState<User | null>(null);
    const [courseName, setCourseName] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [courseContent, setCourseContent] = useState("");
    const [price, setPrice] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [lessons, setLessons] = useState([
            { title: "", content: "" }
        ]);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        getUser();
    }, []);

    const handleSubmit = async () => {
        if (!thumbnailFile) {
            alert("Please select a thumbnail image.");
            return;
        }

        if (!thumbnailFile.type.startsWith("image/")) {
            alert("Only image files allowed");
            return;
        }

        if (!user) {
            alert("User not authenticated");
            return;
        }

        const filePath = `thumbnails/${user.id}/${Date.now()}-${thumbnailFile.name}`;

        const { error: uploadError } = await supabase
            .storage
            .from("Thumbnail-bucket")
            .upload(filePath, thumbnailFile);

        if (uploadError) {
            alert(uploadError.message);
            return;
        }

        const { data: publicUrlData } = supabase
            .storage
            .from("Thumbnail-bucket")
            .getPublicUrl(filePath);

        const thumbnailUrl = publicUrlData.publicUrl;

        const { data, error } = await supabase
            .from("courses")
            .insert([
                {
                    courseName,
                    description: courseDescription,
                    topics_covered: courseContent,
                    thumbnail: thumbnailUrl,
                    price: Number(price),
                },
            ])
            .select()
            .single();

        if (error) {
            alert(error.message);
            return;
        }

        const courseId = data.id;

        const { error: lessonError } = await supabase
            .from("lessons")
            .insert(
                lessons.map((lesson, index) => ({
                    title: lesson.title,
                    content: lesson.content,
                    course_id: courseId,
                    order_index: index,
                    user_id: user.id
                }))
            );

            if (lessonError) {
                console.log(lessonError);
                alert("Lessons failed to save:"+lessonError.message);
                return;
            }

        alert("Course uploaded successfully!");

        setCourseName("");
        setCourseDescription("");
        setCourseContent("");
        setPrice("");
        setThumbnailFile(null);
    };

    const addLesson = () => {
        setLessons([...lessons, { title: "", content: "" }]);
    };

    type Lesson = {
        title: string;
        content: string;
    };

    const handleLessonChange = (
        index: number,
        field: keyof Lesson,
        value: string
    ) => {
        const updatedLessons = [...lessons];
        updatedLessons[index][field] = value;
        setLessons(updatedLessons);
    };

        const removeLesson = (index: number) => {
        const updated = lessons.filter((_, i) => i !== index);
            setLessons(updated);
        };

    return (
        <div>
            <h1>Upload Course Page</h1>

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
                onChange={(e) => {
                    if (e.target.files?.[0]) {
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
            {lessons.map((lesson, index) => (
            <div key={index}>
            <input
                type="text"
                placeholder={`Lesson ${index + 1} Title`}
                value={lesson.title}
                onChange={(e) =>
                handleLessonChange(index, "title", e.target.value)
                }
            />

            <input
                type="text"
                placeholder={`Lesson ${index + 1} Content`}
                value={lesson.content}
                onChange={(e) =>
                handleLessonChange(index, "content", e.target.value)
                }
            />
            <button onClick={() => removeLesson(index)}>Remove</button>
            </div>
))}
            <button onClick={addLesson}>+ Add Lesson</button>
            <button onClick={handleSubmit}>Submit Course</button>
        </div>
    );
}