"use client"

import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function Page() {
const params = useParams()
const [course, setCourse] = useState<any>(null)
const [user, setUser] = useState<any>(null)
const [isEnrolled, setIsEnrolled] = useState(false)

useEffect(() => {
if (!params.id) return

const fetchCourse = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!error) setCourse(data)
}

fetchCourse()

}, [params.id])

useEffect(() => {
const getUser = async () => {
const { data } = await supabase.auth.getUser()
setUser(data.user)
}

getUser()

}, [])

useEffect(() => {
if (!user || !params.id) return

const checkEnrollment = async () => {
  const { data, error } = await supabase
    .from("Enrolled")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", params.id)
    .single()

  if (data) setIsEnrolled(true)
}

checkEnrollment()

}, [user, params.id])

const handleEnroll = async () => {
if (!user) {
alert("Login first")
return
}

const { error } = await supabase.from("Enrolled").insert({
  user_id: user.id,
  course_id: params.id,
})

if (!error) {
  setIsEnrolled(true)
  alert("Enrolled successfully!")
}

}

if (!course) return <div>Loading...</div>

return (
<div style={{ padding: "20px" }}> <h1>{course.courseName}</h1> <p>{course.description}</p> <p>₹{course.price}</p>

```
  <br />

  {isEnrolled ? (
    <div>
      <button disabled style={{ background: "green", color: "white", padding: "10px" }}>
        Enrolled ✓
      </button>

      <br /><br />

      <Link href={`/course/${course.id}`}>
        <button style={{ background: "purple", color: "white", padding: "10px" }}>
          Go to course
        </button>
      </Link>
    </div>
  ) : (
    <button onClick={handleEnroll} style={{ background: "blue", color: "white", padding: "10px" }}>
      Enroll
    </button>
  )}
</div>


)
}
