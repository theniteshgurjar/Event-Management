"use client";

import React from "react";
import Link from "next/link";
import {
    ArrowRight,
    Calendar,
    Users,
    BarChart3,
    ShieldCheck,
    CheckCircle2,
    Trophy,
    Clock,
    Zap,
    Linkedin,
    Github,
    Mail,
    Sparkles,
    Music,
    Ticket,
    Star,
    Flame,
    Compass,
    Building2,
    GraduationCap
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { API_URL } from "@/config/api";

export default function LandingPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

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
                console.error("Login failed", data);
                router.push('/login?error=google_failed');
            }
        } catch (err) {
            console.error("Login Error", err);
            router.push('/login?error=server_error');
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] dark:bg-[#0b0f19] flex flex-col font-sans transition-colors duration-200 comic-dots selection:bg-amber-300 selection:text-slate-950">

            {/* Playful Neo-Brutalist Loader */}
            <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fdfbf7] dark:bg-[#0b0f19] transition-opacity duration-500 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="relative mb-6 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-3xl bg-amber-300 border-4 border-slate-900 shadow-[6px_6px_0px_0px_#0f172a] animate-bounce flex items-center justify-center p-3">
                        <img src="/logo.png" alt="MITS loader" className="w-20 h-20 object-contain" />
                    </div>
                </div>


                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                    EMS - MITS DU
                </h1>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 tracking-wide">Campus Event Management System</p>
            </div>

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-3 bg-[#fdfbf7]/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b-2 border-slate-900 dark:border-slate-800 transition-all">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    {/* Brand / Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] transition-transform flex items-center justify-center p-1">
                            <img src="/logo.png" alt="MITS Logo" className="w-10 h-10 object-contain" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">EMS</h1>
                                <span className="cartoon-sticker bg-indigo-200 dark:bg-indigo-900/60 text-slate-900 dark:text-indigo-200 text-[10px] px-2 py-0.5 border border-slate-900">MITS DU</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Event Management System</p>
                        </div>
                    </Link>

                    {/* Nav Actions */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <ThemeToggle />
                        <div className="hidden sm:block">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => console.log('Login Failed')}
                                theme="outline"
                                shape="pill"
                                text="signin_with"
                            />
                        </div>
                        <Link
                            href="/login"
                            className="cartoon-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2 text-sm font-black tracking-wide"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 lg:py-20">
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto space-y-6 relative">

                    {/* Floating Pill Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <span className="cartoon-badge bg-rose-300 text-slate-950">
                            <Trophy className="h-3.5 w-3.5 text-rose-800" />
                            Official DSW Portal
                        </span>
                        <span className="cartoon-badge bg-sky-300 text-slate-950">
                            <Zap className="h-3.5 w-3.5 text-sky-800" />
                            Zero Paperwork
                        </span>
                        <span className="cartoon-badge bg-emerald-300 text-slate-950">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800" />
                            Multi-Level Fast Approvals
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                        Where University Events <br className="hidden sm:inline" />
                        <span className="inline-block relative">
                            <span className="relative z-10 px-3 py-1 bg-amber-300 dark:bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] rounded-2xl inline-block">
                                Actually Happen!
                            </span>
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                        The all-in-one portal for MITS students, clubs, and deans. Schedule venues, route digital proposals to HODs & DSW, and publish event reports seamlessly!
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href="/login"
                            className="cartoon-btn bg-indigo-600 hover:bg-indigo-500 text-white dark:border-indigo-400 px-8 py-3.5 text-base sm:text-lg w-full sm:w-auto shadow-[4px_4px_0px_#0f172a] dark:shadow-[4px_4px_0px_#818cf8]"
                        >
                            <span>Launch Portal</span>
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            href="/register"
                            className="cartoon-btn bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white px-7 py-3.5 text-base w-full sm:w-auto"
                        >
                            Create Student Account
                        </Link>
                    </div>

                    {/* Fun Stat Badges */}
                    <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
                        <div className="cartoon-card p-3 text-center bg-yellow-50 dark:bg-slate-900">
                            <div className="text-2xl font-black text-slate-900 dark:text-white">3</div>
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Clubs Active</div>
                        </div>
                        <div className="cartoon-card p-3 text-center bg-blue-50 dark:bg-slate-900">
                            <div className="text-2xl font-black text-slate-900 dark:text-white">16+</div>
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Venues & Halls</div>
                        </div>
                        <div className="cartoon-card p-3 text-center bg-emerald-50 dark:bg-slate-900">
                            <div className="text-2xl font-black text-slate-900 dark:text-white">100%</div>
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Paperless</div>
                        </div>
                        <div className="cartoon-card p-3 text-center bg-purple-50 dark:bg-slate-900">
                            <div className="text-2xl font-black text-slate-900 dark:text-white">5★</div>
                            <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Conflict Free</div>
                        </div>
                    </div>
                </div>

                {/* Feature Grid with Neo-Brutalist Cards */}
                <div className="mt-20 sm:mt-28 max-w-7xl mx-auto px-2 sm:px-4 w-full">
                    <div className="text-center mb-12">
                        <div className="cartoon-sticker bg-cyan-300 text-slate-950 mb-3">
                            ⚡ Built for Real Campus Life
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                            Everything You Need to Run Big Events
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 text-base font-medium max-w-xl mx-auto">
                            Designed specifically for deaneries, department heads, student councils, and faculty advisors.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <PlayfulFeatureCard
                            icon={<Calendar className="h-7 w-7 text-slate-950" />}
                            iconBg="bg-amber-300"
                            tag="Timeline"
                            title="Intelligent Calendar"
                            desc="Real-time synchronized event schedule. Visual slot allocation prevents overlapping sound systems and crowded venues."
                        />
                        <PlayfulFeatureCard
                            icon={<Building2 className="h-7 w-7 text-slate-950" />}
                            iconBg="bg-rose-300"
                            tag="Venues"
                            title="Venue Conflict Detector"
                            desc="Colloquium, SH Halls, Conclave Center, and Open Ground availability tracked down to the exact minute."
                        />
                        <PlayfulFeatureCard
                            icon={<ShieldCheck className="h-7 w-7 text-slate-950" />}
                            iconBg="bg-emerald-300"
                            tag="Approvals"
                            title="Multi-Tier Hierarchy"
                            desc="Proposals route automatically from Student Coordinators → Faculty Advisors → HODs → DSW with audit notes."
                        />
                        <PlayfulFeatureCard
                            icon={<Users className="h-7 w-7 text-slate-950" />}
                            iconBg="bg-sky-300"
                            tag="Student Orgs"
                            title="Club Team Management"
                            desc="Presidents, Treasurers, Secretaries, and Faculty Advisors get unified dashboards for inventory and team management."
                        />
                        <PlayfulFeatureCard
                            icon={<BarChart3 className="h-7 w-7 text-slate-950" />}
                            iconBg="bg-purple-300"
                            tag="Analytics"
                            title="Post-Event Reports"
                            desc="Collect attendance sheets, budget receipts, certificates, and competition winner archives into institutional records."
                        />
                        <PlayfulFeatureCard
                            icon={<GraduationCap className="h-7 w-7 text-slate-950" />}
                            iconBg="bg-orange-300"
                            tag="Security"
                            title="Strict RBAC Security"
                            desc="6 Role levels (Student, Coordinator, Faculty, HOD, DSW, Admin) powered by JWT and Google Cloud Authentication."
                        />
                    </div>
                </div>

                {/* Developer Showcase Card */}
                <div className="mt-24 w-full max-w-5xl mx-auto px-2 pb-8">
                    <div className="cartoon-card bg-gradient-to-r from-amber-50 via-white to-rose-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">


                        <div className="relative">
                            <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl bg-amber-400 border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center overflow-hidden">
                                <span className="text-4xl font-black text-slate-900">NG</span>
                            </div>
                            <span className="absolute -bottom-2 -right-2 cartoon-badge bg-emerald-400 text-slate-950 text-[11px]">
                                Lead Architect
                            </span>
                        </div>

                        <div className="text-center md:text-left flex-1 space-y-3">
                            <div className="cartoon-sticker bg-indigo-200 dark:bg-indigo-900 text-slate-900 dark:text-white text-xs">
                                Architecture & Engineering
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                                Nitesh Gurjar
                            </h2>
                            <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                                Full-Stack Software Engineer specializing in modern Next.js 15, PostgreSQL, and performant campus architectures. Built the DSW Event Management System to empower student leadership and administrative transparency.
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                                <a
                                    href="https://www.linkedin.com/in/niteshgurjar/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 hover:bg-[#0077b5] hover:text-white"
                                    title="LinkedIn Profile"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                                <a
                                    href="https://github.com/theniteshgurjar"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 hover:bg-slate-900 hover:text-white"
                                    title="GitHub Profile"
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                                <a
                                    href="mailto:niteshgurjar9399@gmail.com"
                                    className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2.5 hover:bg-rose-500 hover:text-white"
                                    title="Send Email"
                                >
                                    <Mail className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Cartoonish Footer */}
            <footer className="relative z-10 py-6 border-t-2 border-slate-900 dark:border-slate-800 text-center text-sm font-bold text-slate-600 dark:text-slate-400 bg-[#fdfbf7] dark:bg-[#0b0f19]">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 border border-slate-900"></span>
                        <span>MITS-DU Event Management Platform</span>
                    </div>
                    <p>© {new Date().getFullYear()}  Crafted with ❤️ & High Caffeine.</p>
                </div>
            </footer>
        </div>
    );
}

function PlayfulFeatureCard({
    icon,
    iconBg,
    tag,
    title,
    desc
}: {
    icon: any;
    iconBg: string;
    tag: string;
    title: string;
    desc: string;
}) {
    return (
        <div className="cartoon-card cartoon-card-hover p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${iconBg} border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center justify-center animate-wiggle`}>
                        {icon}
                    </div>
                    <span className="cartoon-sticker bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px]">
                        {tag}
                    </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                    {title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                    {desc}
                </p>
            </div>
        </div>
    );
}
