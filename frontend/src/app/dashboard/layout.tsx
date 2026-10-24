"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    MapPin,
    BarChart2,
    Settings,
    Menu,
    X,
    LogOut,
    ChevronRight,
    Shield,
    Building,
    Sparkles
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { API_URL } from "@/config/api";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout, user, token, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [myClubId, setMyClubId] = useState<number | null>(null);

    React.useEffect(() => {
        if (!loading && !token) {
            router.push('/');
            return;
        }

        const fetchMyClub = async () => {
            if (user && ['CLUB_COORDINATOR', 'FACULTY', 'HOD'].includes(user.role)) {
                try {
                    const res = await fetch(`${API_URL}/api/clubs/my-club`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setMyClubId(data.id);
                    }
                } catch (err) {
                    console.error("Failed to fetch my club", err);
                }
            }
        };

        if (token) {
            fetchMyClub();
        }
    }, [user, token, loading, router]);

    if (loading || !token) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-[#fdfbf7] dark:bg-[#0b0f19] comic-dots">
                <div className="w-16 h-16 rounded-3xl bg-amber-300 border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] animate-bounce flex items-center justify-center p-2 mb-3">
                    <img src="/logo.png" alt="Loading" className="w-12 h-12 object-contain" />
                </div>
                <div className="cartoon-sticker bg-indigo-300 text-slate-950">Loading EMS Dashboard...</div>
            </div>
        );
    }

    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        ...(myClubId ? [
            { name: "My Club", href: `/dashboard/clubs/${myClubId}`, icon: Users }
        ] : []),
        { name: "Events", href: "/dashboard/events", icon: Calendar },
        { name: "Clubs", href: "/dashboard/clubs", icon: Users },
        { name: "Venues", href: "/dashboard/venues", icon: MapPin },
        ...(user?.role !== 'STUDENT' ? [
            { name: "Reports", href: "/dashboard/reports", icon: BarChart2 }
        ] : []),
        ...(user?.role === 'ADMIN' || user?.role === 'DSW' || user?.role === 'HOD' ? [
            { name: "Approvals", href: "/dashboard/approvals", icon: FileText },
            ...(user?.role === 'ADMIN' || user?.role === 'DSW' ? [
                { name: "Departments", href: "/dashboard/departments", icon: Building },
                { name: "Users", href: "/dashboard/users", icon: Shield }
            ] : [])
        ] : []),
    ];

    return (
        <div className="h-screen overflow-hidden bg-[#fdfbf7] dark:bg-[#0b0f19] flex font-sans transition-colors duration-200">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Neo-Brutalist Cartoonish Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r-2 border-slate-900 dark:border-slate-800 transform ${
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 transition-transform duration-200 ease-in-out flex flex-col justify-between`}
            >
                <div>
                    {/* Brand Header */}
                    <div className="py-4 px-5 border-b-2 border-slate-900 dark:border-slate-800 bg-amber-50 dark:bg-slate-900/60">
                        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setIsSidebarOpen(false)}>
                            <div className="w-10 h-10 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center p-1 transition-transform">
                                <img src="/logo.png" alt="MITS Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base font-black text-slate-900 dark:text-white leading-none">EMS MITS</span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 border border-slate-900"></span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Event Management System
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <div className="overflow-y-auto py-5 px-3 space-y-1.5">
                        <div className="px-3 pb-2 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                            Main Menu
                        </div>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                                        isActive
                                            ? "bg-amber-300 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] translate-x-1"
                                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-2 border-transparent"
                                    }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-slate-950" : "text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white"}`} />
                                    <span>{item.name}</span>
                                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-slate-950" />}
                                </Link>
                            );
                        })}
                      
                    </div>
                </div>

                {/* Bottom User Card & Theme Toggle */}
                <div className="p-3 border-t-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                    <div className="cartoon-card p-2.5 mb-2.5 bg-white dark:bg-slate-900 shadow-[2px_2px_0px_#0f172a] border-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="h-9 w-9 rounded-xl bg-indigo-500 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                    {user?.name?.charAt(0) || "U"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                        {user?.name || "User"}
                                    </p>
                                    <span className="cartoon-sticker text-[9px] px-1.5 py-0 bg-amber-200 dark:bg-indigo-900 text-slate-900 dark:text-indigo-200 border">
                                        {user?.role || "STUDENT"}
                                    </span>
                                </div>
                                 <ThemeToggle />
                            </div>
                        </div>
                    </div>
                   
                    <button
                        onClick={logout}
                        className="cartoon-btn w-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 py-2 text-xs font-black gap-2 shadow-[2px_2px_0px_#0f172a]"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden comic-dots">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b-2 border-slate-900 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="cartoon-btn p-2 bg-amber-300 text-slate-950"
                            aria-label="Open Menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <img src="/logo.png" alt="MITS Logo" className="w-7 h-7 object-contain" />
                            <span className="font-black text-slate-900 dark:text-white text-base">EMS MITS</span>
                        </Link>
                    </div>
                    <ThemeToggle />
                </header>

                {/* Page Content Viewport */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
