"use client"

import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

export default function AdminPage() {

    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const fetchRequestData = async () => {
            const { data, error } = await supabase
                .from("instructor_requests")
                .select("*");

            console.log("Data:", data);
            console.log("Error:", error);

            setData(data || []);
        };

        fetchRequestData();
    }, []);

    const approveRequest = async (id: string) => {
        const {data , error}  = await supabase
                                .from("instructor_requests")
                                .update({ status: "APPROVED!" })
                                .eq("id", id);    
        console.log("Approving request with ID:", id);
        if (error) {
            console.error("Error approving request:", error);
        }
    }

    const rejectRequest = async (id: string) => {
        const {data , error}  = await supabase
                                .from("instructor_requests")
                                .update({status : "rejected"})
                                .eq("id",id)
        if(error){
            console.error("Error rejecting request",error);
        }
    }

    return (
        <div className="min-h-screen bg-[#FFF5F1]">
            {/* Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h2 className="text-2xl font-black text-[#1A1A1A]">Admin Dashboard</h2>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h1 className="text-5xl font-black text-[#1A1A1A] mb-4">Instructor Requests</h1>
                    <p className="text-lg text-gray-700 mb-3">Manage and review all instructor application requests. Approve qualified instructors or reject applications as needed.</p>
                    <p className="text-sm text-gray-600">Monitor pending requests, view expertise and portfolio information, and make approval decisions to grow your instructor network.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-linear-to-br from-[#1EBBA3] to-[#189a86] rounded-[2rem] p-8 text-white shadow-lg">
                        <div className="text-4xl mb-3">📋</div>
                        <div className="text-sm font-medium opacity-90">Total Requests</div>
                        <div className="text-4xl font-black">{data.length}</div>
                    </div>
                    <div className="bg-linear-to-br from-[#FFB74D] to-[#FF9800] rounded-[2rem] p-8 text-white shadow-lg">
                        <div className="text-4xl mb-3">⏳</div>
                        <div className="text-sm font-medium opacity-90">Pending</div>
                        <div className="text-4xl font-black">{data.filter((r: any) => r.status === "pending").length}</div>
                    </div>
                    <div className="bg-linear-to-br from-[#66BB6A] to-[#43A047] rounded-[2rem] p-8 text-white shadow-lg">
                        <div className="text-4xl mb-3">✓</div>
                        <div className="text-sm font-medium opacity-90">Approved</div>
                        <div className="text-4xl font-black">{data.filter((r: any) => r.status === "APPROVED!").length}</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {data.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm">
                            <p className="text-gray-500 text-lg">No instructor requests at this time</p>
                        </div>
                    ) : (
                        data.map((req: any) => (
                            <div key={req.id} className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border-l-4 border-[#1EBBA3]">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-black text-[#1A1A1A]">{req.reason || "Instructor Request"}</h3>
                                            <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                                                req.status === "APPROVED!" 
                                                    ? "bg-green-100 text-green-700"
                                                    : req.status === "rejected"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}>
                                                {req.status || "pending"}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">Request ID: {req.id.slice(0, 8)}...</p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-[#FFF5F1] rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-[#1A1A1A] mb-2">Expertise</p>
                                        <p className="text-gray-700">{req.expertise || "Not specified"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#1A1A1A] mb-2">Experience</p>
                                        <p className="text-gray-700">{req.experience || "Not specified"}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-bold text-[#1A1A1A] mb-2">Portfolio</p>
                                        <p className="text-gray-700 break-all">{req.portfolio_links || "Not provided"}</p>
                                    </div>
                                </div>
                                {req.status === "pending" && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => approveRequest(req.id)}
                                            className="flex-1 bg-[#1EBBA3] hover:bg-[#189a86] text-white font-black py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-md"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => rejectRequest(req.id)}
                                            className="flex-1 bg-gray-300 hover:bg-gray-400 text-[#1A1A1A] font-black py-3 px-6 rounded-full transition-all duration-300 hover:scale-105 shadow-md"
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                )}
                                {req.status === "APPROVED!" && (
                                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                                        <p className="text-green-700 font-bold text-center">✓ This instructor has been approved</p>
                                    </div>
                                )}
                                {req.status === "rejected" && (
                                    <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                                        <p className="text-red-700 font-bold text-center">✕ This request has been rejected</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}