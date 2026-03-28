"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Course {
  id: string;
  courseName: string;
  description: string;
  price: number;
  thumbnail: string;
  topics_covered: string;
  created_at: string;
}

interface EnrolledCourse {
  course_id: string;
  user_id: string;
  created_at: string;
}

interface UserStats {
  enrolledCount: number;
  completedCount: number;
  inProgressCount: number;
}

export default function Home() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [user, setUser] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    enrolledCount: 0,
    completedCount: 0,
    inProgressCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    checkUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*");
        if (coursesError) throw coursesError;
        setCourses(coursesData || []);

        if (user) {
          const { data: enrolledData } = await supabase
            .from("Enrolled")
            .select("*")
            .eq("user_id", user.id);
          setEnrolledCourses(enrolledData || []);

          const { count: completedCount } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact" })
            .eq("user_id", user.id)
            .eq("completed", true);

          setUserStats({
            enrolledCount: enrolledData?.length || 0,
            completedCount: completedCount || 0,
            inProgressCount: (enrolledData?.length || 0) - (completedCount || 0),
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredCourses = courses.filter(
    (course) =>
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topCourses = courses.slice(0, 3);

  const isEnrolled = (courseId: string) => enrolledCourses.some((ec) => ec.course_id === courseId);

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      alert("Please log in to enroll in a course");
      window.location.href = "/login";
      return;
    }

    try {
      const { error } = await supabase.from("Enrolled").insert({
        user_id: user.id,
        course_id: courseId,
      });

      if (error) throw error;

      const { data } = await supabase
        .from("Enrolled")
        .select("*")
        .eq("user_id", user.id);

      setEnrolledCourses(data || []);
      alert("✅ Successfully enrolled in the course!");
    } catch (error) {
      console.error("Error enrolling:", error);
      alert("Failed to enroll in the course");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setEnrolledCourses([]);
      setUserStats({
        enrolledCount: 0,
        completedCount: 0,
        inProgressCount: 0,
      });
      
      router.push("/");
      alert("✅ Logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F1] font-sans text-[#2D2D2D]">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-black text-[#1A1A1A] tracking-tight">
            LMS<span className="text-[#FF7D44]">ZONE</span>
          </div>
          <div className="flex items-center gap-8 font-medium">
            <Link href="#courses" className="hover:text-[#FF7D44] transition">Courses</Link>
            {user ? (
              <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition">Logout</button>
            ) : (
              <Link href="/login" className="hover:text-[#FF7D44]">Login</Link>
            )}
            <Link href={user ? "/Dashboard" : "/signup"}>
              <button className="bg-[#1EBBA3] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#189a86] transition shadow-md">
                {user ? "Dashboard" : "Sign Up"}
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 z-10">
          <span className="bg-[#FF7D44] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            eLearning Platform
          </span>
          <h1 className="text-6xl font-extrabold leading-tight mt-6 mb-6">
            Smart Learning <br />
            Deeper & More <br />
            <span className="text-[#FF7D44]">-Amazing</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-md mb-10 leading-relaxed">
              Learn practical, real-world skills through structured courses designed to help you grow step by step. Track your progress, build projects, and gain the confidence.        </p>
          <div className="flex items-center gap-6">
            <Link href={user ? "/Dashboard" : "/signup"}>
            <button className="bg-[#1EBBA3] text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition flex items-center gap-2">
              Start Free Trial <span className="text-xl">↗</span>
            </button>
            </Link>
            <button className="flex items-center gap-3 font-bold text-gray-700 hover:text-[#FF7D44] transition">
              <span className="w-12 h-12 bg-[#FF7D44] rounded-full flex items-center justify-center text-white shadow-lg">▶</span>
              How it Work
            </button>
          </div>
        </div>

        <div className="md:w-1/2 mt-12 md:mt-0 relative flex justify-center">
          <div className="w-80 h-96 bg-gray-200 rounded-2xl relative overflow-hidden shadow-2xl border-8 border-white">
             <div className="absolute inset-0 bg-linear-to-t from-[#FF7D44]/20 to-transparent" />
             <img src="data:image/webp;base64,UklGRjYWAABXRUJQVlA4ICoWAAAwbQCdASo+AfUAPp1InUulpCKipRTbcLATiWNu3V8MQ9J2et+L58tw/wv415rCwvKu5f/7HTj8w/9femb5iuiN6B/6m////59sB6D3lw+0h/eMlX+p/4DvdfwH+q5eL285Ub2X3p/V+vz+u73f4LxCPavqlvhHAXfHz1PxvM7kH74T7x6g/6a9ZL/L/bH0N/WvsN+XJ7Ff3K9nr9vTEcC2CoBFx3DNlJZXL2zZQpev1+v1+v19d5ZG/WJFFDz46aqPVrBlTkY3GHIT68VFFnUkz1Bf0FkJ+mU2iofRz//UgKmbR5/5rkrXXbwZfHuahZlJ4BV+8xUMuNVLUbE2tm1vSPxoIYhtPr1H8xXRt7OCnHc2YA3nHB1UdYveY7Hg28Ht0nbWs4+54ullqvSIwYUG0XDGu1nwQFBSMwlAKnSNMhrMkWQfvRRl1KE5aow8M0a3cRj6smsQgjHSxbQp0n5gLk4f2jOzO5lZwPPGljtLvBRFQ4DZy+t/as5yfaBQs8STTbh6qrzl7KNAtm5oPOKxo/UKtSVOz1GErnGtAFW83cDaDBdsFYNCw6zkC7Mb6F0U9vNiLiHtZWK88c4SVV7GeQUqZv6j9MFLs4YRQC04hC0/J69OpkVu9yh+gJBJiObanQGU6klQVSNhazvXOGJiIRtze9XDlHnNeRF9Z7TR8oubxQxC618f+pUCCV7bmKxSJpbVo/maRQsdQ1dTi1gYBRjK3vYDzkyJsw2K2GOOh2jO0wYLSZQqFGlIt3kDiT4kg4vfkw5Sb9ywv/q0TF6Gqwt+VBIhlDB1C1bZINlLt2QLdbc0ifXRMs6ZEzEaI7WEFLkdOqnjTFTehAEqIeW+jww1OZy8ldT9wqG25FWeqmH41Pke2V4W0oGeXpnD0e3aEV6WBbth671ydZmcY/pn+l2lsXbjXvs2bFHvldj3tqkCXN8yxJ0K4OEmXYLxB95xRjXT4UK6A4cMQKzRo+kRP7oY4FLv5QUauzvnsoh1PJlDBqsGFpsL51yfsRRPl2Svq71VeWywANDkvCAuOXLgkPrQTihqerZ347NcQw+SMBYN0ksAc0K/pHKyhLx4srGKzyWvZ0EAjdSoCoUOE8qpdryoEO6xfFRBCTvVRoAkNlPeUc0RIUrZ8fovNnW16OGvgQMMYNu4UhGtKAr974NyCwAA/voapUK0rYAAGLWlJRAFNvidF0uQACJsSYbswP7mKZR6na8j6UUGfVxY3j62rCMlBuG4RfUyYgd8qSAv6/4/oAAhJJP5T8w3mPWK2CFH+XwOe7yxdAiKIWHprS/OgAc3HlJwLa1rwqyvavX2YXNM+GxQ6QJfLXeoZLzA2KWXJDpb8uNKzE0d9GTIzgw2EMpOrLve1CdQ9BFh5fVq294h8snueSCFIDDEcY6Yfyd0T5H7HqhdWH6yQGtbqPA8sdDlpHLENtJnIaYGbKJZxpJzKkZpwCE+EVWg9yTPH/Xu/thZyPFE/5TBp+opM3sFBG4ykQ0zuspJk08HKdH2c1SDHOpE10qpHCL34G1mxVMLlzWaMHu1VIoJazyJwJoblNHIAF0Fmdi0qa96AWZWBZ0qL37HYJay2hsGbAJ/QsGbVqOjjjxxJOT471ws6c9hlrFE+DXJAz12B6aE+LEWnRzjeLVrOKSRyC1GvMevEZxtX/WOlvQLXK5UThNEA/lQfNjHF+wx7xloVBLDPRF6/1Zv2GWcgUXb3J1sEFRlv0LgRtgReKtdBK0Wg/6QLywqnBKNyozy6GelAdYnzMOsilfRYrAoCS/XGesNMlUewj2VUa8XXNEd2AduKPe2cXO98cOZRPjgY1TA2KNgHIdbJt3FWbSEVmmKeORiOTt3xfP8u8aEFavAg+CdIYqPXtPlG6or8xfd2pyNRqHh8eCMJREpaIu2wBT70Ah4iE8+m+V5lY+q4Lx4W8YLyAivgwvYIaiRcn/YihddeZxRAmpf5kvyxxhep6NDkdgDPVrA4g6wZXxjtSFcSlHp/vXZ2KTnj4/6iUoU8kSpR5gA6H+Q2eUAFJk9/+qQKYXaW7pcDE2YiGlIDuXcYFsv7EjZJwzwl4Re5LeZX1t4DwtOANKeGuHcSerKY+qqTsAiRvduwdvnpV7TSbqhq0zGb2NnPtguYKFUkh+ni8HCTBD+3hbrb53Abr9kl5BQPEtopG2hOdFv9v0Zhl/ZNG2S7sRpA2iTbmYwi/cXYqBe8EZmOLYqSWoUrWWImd6tZg0GoTmgUOnRFcZQ+8s3FoEqsYoyJc3SRwc/73SOTWXSC6jK+QrzqrUS1mtaVfhVpTbIxpt2QPqZWK7ZKMDeempLfJ8BoUvBec4CEAJAZPNRAIfOchS010/yHHyXLQFSkNAh5UyqiDydCdttHJntdmS5kokjVRHD+cOc/9D0Q899S3TW4vT2K57jTD2T6nDnHAuWsndb7C5HWkdsMq16j8lEfpiV/kt9z2v8pRjAkou5fT7TvpydZbkOZRuoQA6vaZu87EUgTSUnFzEqC2L54c6ANxzm/Ti6ZnwQnY80Fn0HSUuf2RLKexisrkCxF0kiZGP+5lRzzGTQrvzhhjP4r2x+ONyIRn9ttARVc2fJmIKRhKqQxI+8oEPxbo3+nWG3yhGXgzXmzjwK8MFo9ktg3T/W2tn/8Qv1Vsx6+tLy9ENlLXlUYqSlAewKmvjISNLmscbPa3pIiZKvYHun3k+6cAfOTrJF0ErC4GaHERpHBoip1iv8GeF4fStgEoDuGGEIcBQ6porXetRCPAHBKCkGv4BV/KFZL/UAID7Qx5lVkvdqQCsNdOrAWM8Dwf389zv4qTsoMNRXpMc3UdublFJVOoxEtFNQjKO7mvbkIk+Ta/fL7GhS4ydIGhme94hUUWaBhpRKCUt6xJLaQm1FaTVXbgCgdRZtDkoTuNp7NOBDU2sokRF2cyjUVGeN1CeUfoATA/Yuvevl9tHWdGezjF6miP5PkJWK5EtM9yn7lDb/zsO4zaNBsS8AIFK1OsKYEf2lFHYX8y5yPq2v3w2Tp6qbe3zKghzsDYB3yP0A/B6gUwwd36wfpw09sIHkourgdzIUk7xVfljeSB7uRefAhAZPISQsAy1nv7Ft6J4bIIU3re/warEwleeUlw1dt5xw8t/WVWHGD7ZSiW0rx5W6r1E7fg4CIPE7NLpB0Yj96stvIKzXlX5vt5pJSRAqq7OVYzpC+dx8PyJPu21guCAADHtDRvA9b1wtwZQ6MQ8DDbnRBd3jBHhKXMiBhp3DhGhVT+z1fAYadRCBwYjebH8pq6ELzpLteI5Q0FsqBJi2DOD9uoHo/CnuqR4YZR7lUzbO5x7lvpQ68VOj4HYkQvBxLYdwy2KkUxMsB2neqRujhf0cspQAmV1y16FHYPjSjxSww/yccURQlyiLS9RJQfhrJ5+UOl8VTMTqOIFCd0c25TVv61MBxZD2/5kLv9OzkJsYv6b1kwQgxkW6+Jzkz67S32qx0KBaMuOku4FMsjf6SVnx6qOGSYo12tMyleFtInEVAH4oy4OEZu5SgQeERK1xoay6WBHdebKc0RtHcmQccX6J6Xf2TBxjmK7OuosJd0pqQYmx2c3RvUB3l2Gpz665OC4gfmdmDeosdkw9pi4qMH8ItnUoa49QS3Ub+NbAByxyZ3C5n/hPhgr+3VJAU3EsgdmWkimpcOlA/fE/N+2n0e+wyN4TygHDmA5RfvfLAjcYyr4Q0sx4mPFyYX5RwPFmnGlQk5CCZjFGIi8yI/frOe1uR2FbrFL/QRhcolbr3lHwLUsZbvoHvwKPef0E63i2ZaZ00H/Lk/N9++b4LXJg+da4roL220GfdhPuS+XEDH1onyIscNAxuvObSzrS/sJvpTijguuXJt9kuCpvPWLYkgRxuEeBR8FEHKIK/PImrEHDCuho9TsDpZ2/li50TT4wuzfgLqSFTIi52pnfPPYCIzujPxgiV2+rK+g0sQj9em8fXW8eMUPvR81ZER59wQfbZd9PPfK2eez1DhVXWqA19bnd8RXODEydGA2vexkpFLX4QyuBTEs5TUfsGuB1eAMMyc0W9bzswRTwyRab0TdgL7Ot3k7qZGxnOtGj9nmEsLyXZQtg5S6wj7hJ39BhwBCURThy6i8NqUaA6DO70riFNe7KZ43xnf5EyVlHUKHNXOVXGFUtoD8PzZa7AXsdwsL5OnYws5EHXrnDBdSfFzqDLwgHa2yKUfY6tmo7RiE7QhkhTERjZgjhAX7pMxb1pKZ0aAUBzY+9iEBFnZFxUfLMCOVM6Pzz45YkTO0j4nCy/3EbbIRyDllHBJZMX4L72nRwnFVDCoNfMGq6l9cwv0aLPfnkiv3LoE5MirscCgrR+H5W81U/JvSLBNogrIJW9BrnkCVQgHu0PpPJPSY2XSIoCKu+DcWHA7Z5mry4HZbV4HKrUWnv2uc/IS3qClfZZRNr6g0rV/lxhxoHRVk+odq1R1nPsvK2qu1jZ53bCZciTaHuX/otYd0D3pvTpo9KIVdXn5Kn2xXrXLugi6C5hfk9051Rrv0Mj8Y54BwvncGtxi9JFQRGYh/JXxmuHAE5GMgwSONuuxleekZuNTieqPfLawPoyecjDBguvGk2LPjrWxrebwoJ4ZJFSnOkipFy3ms+W6CL+GHpTX73xDtSEVMiWa5Bu2EPjRG3GPwDmubfFxWQh7a68vNu96pTrDwSt81u5PXMXYlLs5lY81LuZi6wL6cW7dbjDUIKPwLBgZoXJRCf6MHvR4TN9Rt/QYW1ZL8SH2+ZWdpFfDZph0fB9/kru+GbUXXJ/DJCvbnDrKxk2qcz4TbddMVOSvl4odSLQedpaows0CGySzcUQciwXSglVOHXw3HRfPmwWTb2nmWm/gm1G/2r1mJxwMp/vqRwEim0Iix8uv+gm6qqkGBvNgSidzf2rokRmOS9rdml+ksnF2jdfGXfTyInuHKZ2uKUhEEEIglunP9E8wu3Ei8cp/SNpgQ4AIIVI7S2eSOb3nUjQ8v8F8J7+R4H7O+CegLr7Vpw/zO3wT4Wgjdg5POq7zgl6KFUKjS6mYoVDSUd90Nxx/9umpPrtD+cYMwI2MYNu9A7Z6sEkftjsX3r2GO8NQOTzjxDarKOJhwoExVxBRuG1VZsluRTt3yVAt9tqADH35LIWM9aXMplCOCyONHmYanl/TKwVpJki4xvMpCMJQMOvq5EZDyeuKbtQzaIbeUM9DPytloI2Smj05No06g1sjqEkSfJx44tiEEuKS99sJZECfv3E/eDXMhJwjSHi/bUFKKf8uBKN2946+xTx8i2L/79jZZCshtMEFHuLCm6B93zgND79akqqte9qBMAGkQvKrHDnHUv8Bzeu099Zvc0upM8N3+AtS7Pny+9EqBnJYoaxRPx+cDNjQSE+TcSm954NUO5NtoH8bSwAjSJFv1iLmrnSh1kR2zbWwWGRPW5NsmE/iBZdTFNBo/MVeNauLXlo1yDXEzfHuPg8bAlE1OtpUgHvGtKBtYtefkW9DYqTRRqAEqb4zLcMROynp05bc0wDGAYBtaZPKCDob7icWAYWlWfboC144oEoEtN/aYFc7I/idC6HiX+t6VQijZQinNCYpsWY/MsebXXv00UHPl7HM232qZw5Qzi078b0VmN2vRdQcB6cFVXMYqrkSre+/QGinnfUQH6OpxoDeQyC/BxG3IaR8Y8XpAHQubEHZmlu37afteYeuUALqpN6AhtJij2J9oQaPInnB/GugDtm9ScdF36KHlYA3FJXli0j3JViJHULsn7gCk7hrnQ//IaPRKIDLklfX/SaPSMOn7wB8306/OkGMEka4Y6uJiiDJfeEheRSOhvBaTvByryK76GILDzFpT8G8J9R0Qt8Nb5HTjZcaO9fek0HWZ5xTP7IKtahAcQR1Rx3VI4l9Ajzl5bHVayro3UXRmqz0bg5mGFNsBBt82vfd/zyuriM7GJY5+9z+S30rsmmxfbP5tkojNg0XRKUleOeviby/8f8VAL6u5KnH0uf8OVhbEoDjRbI3KOzNKlhQxDEfS4HgOZkgNqCF0lWQHRDSkvy6/bbuJdcYon7gB1XBbXyWPKBMsEjrX3t95fLep467CkKXR5pA7+Qucec3+haNoc0vrSuxfsefCnnOjuPgd9cpiJVTBWLW577X0ENKNYlrISBYIGs7BNFKdZLZmQ2Df2O0KLxNh/icAHpepJOOoPwpB7lmYwlt0jM+ChmN0a1xySvap7SkHzr/Cmn3zMb0MN5+6A9GcJRHBy0sKYfUNBmtvYxTsaG4ID8WBh+HqmuOv3FHG9leIIUVyDKBUY9BYqV/xFrilfCnPBwDxT6BOOmQ8/tJcfrUHK9+Md8Zk76/M9DSmSPSQuTvROthhhIQZHSTKjF/mUviXtLAo/CmXR9hRB+4anxiEtUmztvRCXOA4/9fKd185/AOK6/0EbpwuoemxoBobfurJYMeQrVpG0oNuz0kGEVvSqcLjITti8CXrChdjdaziySTnPExVFe+d4L1SD7qoLebsuh4kBy8LRdgHRKzZd1CJbB7wcD0Q/sLS6YokYOR+ZJ2fYKOLscp1TFPU31V465xqsqV97Ihl6rRPj160hF7PzN3DKVWHSBExzLyFeAYgtsBJi21WiYfOp11pyPSL2DqQUhCIC8/N6NZCr50dNOZh93OWHFVKID/IRs4AO5ugwjcd1lijXf8lLiiMiE636VcNw4ZYk5jPx1SfQAPs+YWyOCHaHFsRKEJWczHFHzESlKnVTbtBMHayy6dNEYAGjDoQKdCWaB7aiPy/lbcQnWC/ZJhKaqclMQ5xZfOHsPWSj7AEUUQtBDZsn5vIylejGoe1HBRfQcpfPQZDc6d56EugLPYPFHukeNr9mVHNmxC2dKdLbPckFvyzENX9Nl5PvDkTrskbpRJHhRcPhc9+DxS1SjTn8v/HgVSYtNvGv6hS+t/HFtt7flY1MCmaiLg6x04GlLs125jATbls9Kt529iYnZSeJTTczD7A1ikmtW1WddvXU2HHCjNx77+Q9BQZ49Vn/iWlTAA4rA2cXJbrRyvhxt7UCXqHUXYdnalpx6KPom6mS4P86nPH6ksKVg79/gWqeXIqq5afW4LfUT214y7klysRHX09u11Rnrh/cDoydHsb3FlNY9GZBA/Cu3Iee7B9u04Mzl48sq9BgEIDcJcmq37IwQ2Ksfedo9IVbaHzj2OoQX7OGBZ4j5PzIO15SLNcyqSc6jxX0i9sKlZDQ6pCklyq4tiD0m0ETrCJOZjOU6sguAEIqqSemk4Gv76DeScMOWxdHvdQHFFnXyZPPknhYACGfNvkdLnHtNL1E3aSd3jMoiDv8tx1UyY1TY7+oKB+fzwLVhCreB20VVi9qo9sP0O4GZAAIdBkxrVwtM6PYaI4TUJGYLTDTxh7n1h57Qb5AyLT0xTfXpigfPTpYR7/cpSS2UP1pNlXm8cjMXD2kokECr57DxbuHaWfPbm0OMWNHb6/GohrSA5VJMGVXT7Ulrh16z2gjzgY6OkpVgh1owBBfIsuebHfHzT3abLfNCAhrLbPwAD9dcj4GmIxGfMXmEhpFjD5VMuntvrc3Mivt/s77FoAAAAAK7oAA" alt="Hero" className="flex items-center justify-center h-full text-8xl" />
          </div>
          <div className="absolute top-10 right-10 bg-white p-3 rounded-xl shadow-lg animate-bounce">✅</div>
          <div className="absolute bottom-10 left-10 bg-white p-3 rounded-xl shadow-lg">⭐️</div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center mb-12">
              <span className="bg-[#1EBBA3] text-white px-4 py-1 rounded-full text-xs font-bold">About Us</span>
              <p className="mt-4 text-xl font-semibold text-gray-600 max-w-3xl mx-auto">
                We are passionate about empowering learners Worldwide with high-quality, accessible & engaging education.
              </p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center border-t border-gray-100 pt-12">
              <div>
                <p className="text-5xl font-black mb-2">25+</p>
                <p className="text-gray-400 text-sm font-medium">Years of Experience</p>
              </div>
              <div>
                <p className="text-5xl font-black mb-2">256k</p>
                <p className="text-gray-400 text-sm font-medium">Students Enrolled</p>
              </div>
              <div>
                <p className="text-5xl font-black mb-2">170+</p>
                <p className="text-gray-400 text-sm font-medium">Expert Teachers</p>
              </div>
           </div>
        </div>
      </section>

      <section id="courses" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="bg-[#FF7D44] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Featured Courses</span>
            <h2 className="text-4xl font-black mt-4">Our Best Courses</h2>
            <p className="text-gray-500 mt-2">Handpicked courses to help you get started</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin">
              <div className="text-4xl">⏳</div>
            </div>
            <p className="text-gray-400 mt-4">Loading amazing courses...</p>
          </div>
        ) : topCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No featured courses available right now!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group">
                  <img src={course.thumbnail} alt={course.courseName} className="aspect-video bg-[#FDF0E9] rounded-t-[2rem] flex items-center justify-center text-6xl group-hover:scale-110 transition duration-300 overflow-hidden" />
                  <div className="p-6">
                    <h3 className="text-xl font-extrabold mb-3 line-clamp-2 text-[#1A1A1A]">{course.courseName}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 h-10">{course.description}</p>
                    
                    {course.topics_covered && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.topics_covered.split(",").slice(0, 2).map((topic, idx) => (
                          <span key={idx} className="bg-[#FDF0E9] text-[#FF7D44] text-xs px-3 py-1 rounded-full font-semibold">
                            {topic.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 gap-3">
                      <span className="text-2xl font-black text-[#FF7D44]">${course.price}</span>
                      <div className="flex gap-2">
                        {isEnrolled(course.id) ? (
                          <Link href={`/course/${course.id}`} className="flex-1">
                            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm transition">
                              Continue
                            </button>
                          </Link>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEnroll(course.id)}
                              className="flex-1 bg-[#1EBBA3] hover:bg-[#189a86] text-white px-4 py-2 rounded-full font-bold text-sm transition"
                            >
                              Enroll
                            </button>
                            <Link href={`/coursedetails/${course.id}`}>
                              <button className="bg-gray-100 hover:bg-gray-200 text-[#FF7D44] px-4 py-2 rounded-full font-bold text-sm transition">
                                Details
                              </button>
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/Dashboard">
                <button className="bg-[#FF7D44] hover:bg-[#e56a2e] text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-lg">
                  Explore All Courses in Dashboard →
                </button>
              </Link>
            </div>
          </>
        )}
      </section>

      <footer className="bg-linear-to-b from-slate-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="text-2xl font-black mb-4">
                LMS<span className="text-[#FF7D44]">ZONE</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Empowering learners worldwide with high-quality education and cutting-edge technology.
              </p>
              <div className="flex gap-3">
                <a href="#" className="bg-[#FF7D44] hover:bg-[#e56a2e] p-3 rounded-full transition">📱</a>
                <a href="#" className="bg-[#FF7D44] hover:bg-[#e56a2e] p-3 rounded-full transition">🐦</a>
                <a href="#" className="bg-[#FF7D44] hover:bg-[#e56a2e] p-3 rounded-full transition">💼</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-[#FF7D44] transition">Home</Link></li>
                <li><Link href="#courses" className="text-gray-400 hover:text-[#FF7D44] transition">Courses</Link></li>
                <li><Link href="/Dashboard" className="text-gray-400 hover:text-[#FF7D44] transition">Dashboard</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FF7D44] transition">About Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Learning</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#FF7D44] transition">Browse Courses</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FF7D44] transition">Certifications</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FF7D44] transition">Learning Paths</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FF7D44] transition">Become Instructor</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#FF7D44] transition">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FF7D44] transition">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FF7D44] transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#FF7D44] transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                &copy; 2026 LMSZONE. All rights reserved. Built for Amazing Learners.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-[#FF7D44] text-sm transition">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-[#FF7D44] text-sm transition">Terms</a>
                <a href="#" className="text-gray-400 hover:text-[#FF7D44] text-sm transition">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}