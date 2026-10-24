"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, AlertCircle, ArrowRight, Loader2, Sparkles, GraduationCap } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { API_URL } from "@/config/api";

export default function RegisterPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.token && data.user) {
                    login(data.token, data.user);
                } else {
                    router.push('/login?registered=true');
                }
            } else {
                setError(data.message || "Registration failed. Please check your details.");
            }
        } catch (err) {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#fdfbf7] dark:bg-[#0b0f19] font-sans relative comic-dots transition-colors duration-200">

            <div className="w-full max-w-xl flex justify-between items-center mb-6 z-20">
                <Link
                    href="/"
                    className="cartoon-btn bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2 text-xs font-black gap-2"
                >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to Home
                </Link>
                <ThemeToggle />
            </div>

            <div className="w-full max-w-xl relative z-10">
                <div className="cartoon-card bg-white dark:bg-slate-900 p-8 sm:p-10 relative overflow-hidden">

                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-3xl bg-amber-300 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center mx-auto mb-3 animate-wiggle p-2">
                            <GraduationCap className="w-10 h-10 text-slate-950" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-bold">
                            Join MITS-DU Campus Event Management System
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Nitesh Gurjar"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium bg-slate-50 dark:bg-slate-950"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block mb-1.5">
                                University Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="student@mitsgwl.ac.in"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium bg-slate-50 dark:bg-slate-950"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium bg-slate-50 dark:bg-slate-950"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="cartoon-badge bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-500 w-full py-2 justify-start">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span className="text-xs font-bold">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="cartoon-btn w-full bg-amber-400 hover:bg-amber-300 text-slate-950 py-3 text-sm font-black shadow-[3px_3px_0px_#0f172a] mt-3"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {loading ? "Creating Account..." : "Register Now"}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-xs text-slate-500 font-bold mb-1">Already registered?</p>
                        <Link
                            href="/login"
                            className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                        >
                            Sign in to existing account <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
