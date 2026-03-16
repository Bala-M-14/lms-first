"use client";

import { useRouter } from "next/navigation"
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {

    const userRouter = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleLogin = async () => {
        const {error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

    if(error)
    {
        alert("Login failed: " + error.message);
    }
    else
    {
        userRouter.push("/dashboard");
    }
};

    return (
        <div className="text-black">
            <h1>Login</h1>
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
            <button onClick={handleLogin}>Login</button>
        </div>
    )};