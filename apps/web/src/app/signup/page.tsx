"use client";

import {supabase} from "@/lib/supabaseClient";
import { useState } from "react";
import { useRouter } from "next/navigation"

export default function signup() {
    const userRouter = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const handleSignup = async () => {
        const {error} = await supabase.auth.signUp({
            email,
            password,
            options: { data: { username: username } },
        });

        if (error) {
            alert("Signup failed: " + error.message);
        } else {
            userRouter.push("/login");
        }
    };

    return (
        <div className="text-black">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={handleSignup}>Signup</button>
        </div>
    )};
