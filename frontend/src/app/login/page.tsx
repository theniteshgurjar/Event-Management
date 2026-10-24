"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import {
    Mail,
    Lock,
    AlertCircle,
    ArrowRight,
    Loader2,
    Sparkles,
    Shield,
    GraduationCap,
    Building2,
    Users,
    Info
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { API_URL } from "@/config/api";

// Demo Accounts Definition (Super Admin credentials removed for security)
const DEMO_ACCOUNTS = [
    {
        role: "DSW",
        title: "Dean of Student Welfare",
        email: "dsw@dsw.com",
        password: "admin123",
        badgeColor: "bg-purple-300 text-slate-950",
        icon: Shield,
        description: "Institutional clearance, auditorium sanction, and archive auditing."
    },
    {
        role: "HOD",
        title: "Head of Dept (CSE)",
        email: "hodcse@dsw.com",
        password: "admin123",
        badgeColor: "bg-sky-300 text-slate-950",
        icon: Building2,
        description: "Departmental checks, academic schedule sync, and hall approvals."
    },
    {
        role: "FACULTY",
        title: "Faculty Advisor",
        email: "faculty2@dsw.com",
        password: "admin123",
        badgeColor: "bg-emerald-300 text-slate-950",
        icon: GraduationCap,
        description: "Mentors club activities, reviews event budgets, and endorses proposals."
    },
    {
        role: "COORDINATOR",
        title: "Club Coordinator",
        email: "hindisamiti@dsw.com",
        password: "admin123",
        badgeColor: "bg-rose-300 text-slate-950",
        icon: Users,
        description: "Drafts event proposals, books venues, and submits post-event archives."
    },
    {
        role: "STUDENT",
        title: "Student User",
        email: "student@dsw.com",
        password: "admin123",
        badgeColor: "bg-cyan-200 text-slate-950",
        icon: Sparkles,
        description: "Explores events, checks venue schedules, and views public reports."
    }
];

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

    const handleSubmit = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
        if (e) e.preventDefault();
        setError("");
        setLoading(true);

        const loginEmail = customEmail || email;
        const loginPassword = customPassword || password;

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.token && data.user) {
                    login(data.token, data.user);
                } else {
                    login(data.token, data.user || { name: "User", email: loginEmail, role: "user" });
                }
            } else {
                setError(data.message || "Invalid credentials. Please select a demo account or try again.");
            }
        } catch (err) {
            setError("Server error. Please ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDemo = (acc: typeof DEMO_ACCOUNTS[0], autoLogin = false) => {
        setEmail(acc.email);
        setPassword(acc.password);
        setSelectedDemo(acc.email);
        setError("");

        if (autoLogin) {
            handleSubmit(undefined, acc.email, acc.password);
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
            } else {
                setError(data.message || "Google login failed.");
            }
        } catch (err) {
            setError("Google login failed. Server error.");
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-start py-8 px-4 sm:px-6 bg-[#fdfbf7] dark:bg-[#0b0f19] font-sans relative comic-dots transition-colors duration-200">

            {/* Top Navigation Bar */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-6 z-20">
                <Link
                    href="/"
                    className="cartoon-btn bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2 text-xs font-black gap-2"
                >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back to Portal Home
                </Link>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </div>

            {/* Main Presentation Container */}
            <div className="w-full max-w-5xl relative z-10">

                {/* Split Login Card: Sign-In Form (Left) & Demo Accounts (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Interactive Login Form (7 Cols) */}
                    <div className="lg:col-span-7 cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
                        
                        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 dark:border-slate-800">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    Sign In with Credentials
                                </h3>
                                <p className="text-xs font-bold text-slate-500 mt-0.5">
                                    Authenticate as chosen role or custom university account
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-xl">
                                🔐
                            </div>
                        </div>

                        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider block mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                                    <input
                                        type="email"
                                        placeholder="user@dsw.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-900"
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
                                        className="w-full rounded-xl py-2.5 pl-10 pr-3 text-sm font-medium bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-900"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="cartoon-badge bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-500 w-full py-2.5 justify-start">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-xs font-bold">{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="cartoon-btn w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 text-sm font-black shadow-[4px_4px_0px_#0f172a] mt-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                {loading ? "Verifying Credentials..." : "Launch Dashboard"}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center my-4">
                            <div className="w-full border-t-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                            <span className="cartoon-sticker bg-amber-200 dark:bg-slate-800 text-slate-950 dark:text-white text-[10px] px-2.5 py-0.5 absolute">
                                OR GOOGLE AUTH
                            </span>
                        </div>

                        {/* Institutional Google Login */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-900 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-[10px]">
                                    Institutional OAuth
                                </span>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white mt-1">
                                    MITS University Account
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                    Instant login for @mitsgwl.ac.in emails
                                </p>
                            </div>

                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError("Google Sign-In failed")}
                                theme="outline"
                                shape="pill"
                                text="signin_with"
                            />
                        </div>

                        {/* Register Link */}
                        <div className="pt-2 text-center text-xs font-bold text-slate-500">
                            <span>Evaluating as a new student? </span>
                            <Link
                                href="/register"
                                className="font-black text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                            >
                                Register fresh account <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>

                    </div>

                    {/* Right Column: 1-Click Demo Accounts (5 Cols) */}
                    <div className="lg:col-span-5 cartoon-card bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/80 p-6 sm:p-7 space-y-5">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                                    🎓 Evaluator / Demo Access
                                </span>
                                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                Instant Demo Accounts
                            </h3>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                                Click any role below to test full permissions with zero typing:
                            </p>
                        </div>

                        <div className="space-y-2.5">
                            {DEMO_ACCOUNTS.map((acc, i) => {
                                const IconComp = acc.icon;
                                const isSelected = selectedDemo === acc.email;

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleSelectDemo(acc, false)}
                                        className={`cartoon-card p-3 cursor-pointer transition-all flex items-center justify-between group ${
                                            isSelected
                                                ? "bg-amber-100/80 dark:bg-slate-800 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a]"
                                                : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl ${acc.badgeColor} border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center shrink-0`}>
                                                <IconComp className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                                        {acc.title}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-bold text-slate-400">
                                                        ({acc.role})
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                                                    {acc.email}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectDemo(acc, true);
                                            }}
                                            className="cartoon-btn bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 px-2.5 py-1 text-[11px] font-black shrink-0"
                                            title="Log in directly as this role"
                                        >
                                            Sign In →
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-slate-800/60 border border-slate-900/30 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Info className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>All demo accounts use password: <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-900 text-slate-950 dark:text-white font-mono">admin123</code></span>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
