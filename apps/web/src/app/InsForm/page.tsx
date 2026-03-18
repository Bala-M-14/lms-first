"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";

export default function InsForm() {
    const [expertise, setExpertise] = useState("");
    const [experience, setExperience] = useState("");
    const [reason, setReason] = useState("");
    const [portfolio_links, setPortfolioLinks] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        const getUserAndStatus = async () => {
            const { data } = await supabase.auth.getUser();
            const currentUser = data.user;
            setUser(currentUser);

            if (currentUser) {
                const { data: reqData, error } = await supabase
                .from("instructor_requests")
                .select("status")
                .eq("user_id", currentUser.id)
                .limit(1);

                if (error) {
                    console.log(error);
                    return;
                }

                if (reqData && reqData.length > 0) {
                    setStatus(reqData[0].status);
                } else {
                    setStatus(null);
                }

                console.log(reqData);
                console.log(currentUser.id);
            }
        };

        getUserAndStatus();
    }, []);

    const name = user?.user_metadata?.username;

    const handleSubmit = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const currentUser = userData?.user;

        if (!currentUser) {
            alert("User not authenticated");
            return;
        }

        if (status) {
            alert("You already submitted a request");
            return;
        }

        const { error } = await supabase.from("instructor_requests").insert({
            user_id: currentUser.id,
            expertise,
            experience,
            reason,
            portfolio_links,

            status: "pending",
        });

        if (error) {
            alert("Error submitting request: " + error.message);
        } else {
            alert("Request submitted successfully!");
            setStatus("pending"); 
            setExpertise("");
            setExperience("");
            setReason("");
            setPortfolioLinks("");
        }
    };

    

    return (
        <div className="text-black">
            <h1>InsForm</h1>

            <input
                type="text"
                placeholder="Name"
                className="border p-2 mb-4"
                value={name || ""}
                disabled
            />

            <input
                type="text"
                placeholder="email"
                className="border p-2 mb-4"
                value={user?.email || ""}
                disabled
            />

            {status && (
                <h2 className="mb-4">
                    Status: <b>{status}</b>
                </h2>
            )}

            {!status && (
                <>
                    <input
                        type="text"
                        placeholder="Your expertise"
                        className="border p-2 mb-4"
                        value={expertise}
                        onChange={(e) => setExpertise(e.target.value)}
                    />

                    <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="border p-2 w-full mb-4"
                    >
                        <option value="">Select experience</option>
                        <option value="0-1">0–1 years</option>
                        <option value="1-3">1–3 years</option>
                        <option value="3+">3+ years</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Additional information"
                        className="border p-2 mb-4"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />

                    <input
                        type="url"
                        placeholder="Portfolio links"
                        className="border p-2 mb-4"
                        value={portfolio_links}
                        onChange={(e) =>
                            setPortfolioLinks(e.target.value)
                        }
                    />

                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Submit Request
                    </button>
                </>
            )}
        </div>
    );
}