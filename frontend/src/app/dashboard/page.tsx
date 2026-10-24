"use client";

import React, { useEffect, useState } from 'react';
import { Calendar, Users, FileCheck, ArrowUpRight, Clock, Loader2, AlertCircle, Sparkles, PlusCircle, Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { API_URL } from '@/config/api';

export default function DashboardPage() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState<any>(null);
    const [recentEvents, setRecentEvents] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [myClub, setMyClub] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;
            setLoading(true);
            try {
                // 1. Fetch Overall Analytics
                const analyticsRes = await fetch(`${API_URL}/api/analytics/overall`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const analytics = await analyticsRes.json();

                // 2. Fetch Recent Events (Upcoming & Approved)
                const eventsRes = await fetch(`${API_URL}/api/events?limit=5&upcoming=true&status=APPROVED`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const events = await eventsRes.json();

                if (analyticsRes.ok) setStatsData(analytics);
                if (eventsRes.ok) setRecentEvents(events);

                // 3. Fetch Notifications (Real)
                const notifsRes = await fetch(`${API_URL}/api/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                let notifs = [];
                if (notifsRes.ok) {
                    notifs = await notifsRes.json();
                }

                // 4. Fetch My Club (For Coordinators/Faculty/HOD)
                if (['CLUB_COORDINATOR', 'FACULTY', 'HOD'].includes(user?.role || '')) {
                    const clubRes = await fetch(`${API_URL}/api/clubs/my-club`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (clubRes.ok) {
                        const clubData = await clubRes.json();
                        setMyClub(clubData);
                    }
                }

                if (typeof window !== 'undefined') {
                    const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
                    notifs = notifs.filter((n: any) => !dismissed.includes(n.id));
                }
                setNotifications(notifs);

            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    const handleClearNotifications = () => {
        const currentIds = notifications.map(n => n.id);
        setNotifications([]);

        if (typeof window !== 'undefined') {
            const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
            const newDismissed = Array.from(new Set([...dismissed, ...currentIds]));
            localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
        }
    };

    const handleDismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (typeof window !== 'undefined') {
            const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
            if (!dismissed.includes(id)) {
                dismissed.push(id);
                localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed));
            }
        }
    };

    const stats = [
        ...(myClub ? [{
            title: "My Club",
            value: myClub.name,
            tag: "Manage",
            icon: Users,
            bgCard: "bg-indigo-50 dark:bg-slate-900",
            iconBg: "bg-indigo-300",
            link: `/dashboard/clubs/${myClub.id}`,
            isImage: !!myClub.logoUrl,
            imageUrl: myClub.logoUrl
        }] : []),
        ...(user?.role !== 'STUDENT' ? [{
            title: "Total Events",
            value: statsData?.events?.total || "0",
            tag: "All Time",
            icon: Calendar,
            bgCard: "bg-amber-50 dark:bg-slate-900",
            iconBg: "bg-amber-300",
            link: "/dashboard/events"
        }] : []),
        ...(['ADMIN', 'DSW'].includes(user?.role || '') ? [{
            title: "Active Clubs",
            value: statsData?.clubs?.active || "0",
            tag: "Registered",
            icon: Users,
            bgCard: "bg-sky-50 dark:bg-slate-900",
            iconBg: "bg-sky-300",
            link: "/dashboard/clubs"
        }] : []),
        ...(['ADMIN', 'DSW', 'HOD'].includes(user?.role || '') ? [{
            title: "Pending Approvals",
            value: statsData?.events?.pending || "0",
            tag: "Needs Action 🔥",
            icon: Clock,
            bgCard: "bg-rose-50 dark:bg-slate-900",
            iconBg: "bg-rose-300",
            link: "/dashboard/approvals"
        }] : []),
        ...(user?.role !== 'STUDENT' ? [{
            title: "Reports Verified",
            value: statsData?.financials?.reportsSubmitted || "0",
            tag: "Completed",
            icon: FileCheck,
            bgCard: "bg-emerald-50 dark:bg-slate-900",
            iconBg: "bg-emerald-300",
            link: "/dashboard/reports"
        }] : []),
    ];

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-3xl bg-amber-300 border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] animate-bounce flex items-center justify-center p-2 mb-3">
                    <img src="/logo.png" alt="Loading" className="w-12 h-12 object-contain" />
                </div>
                <span className="cartoon-sticker bg-indigo-300 text-slate-950">Refreshing Live Dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
            {/* Top Welcome Banner */}
            <div className="cartoon-card p-6 sm:p-8 bg-gradient-to-r from-amber-200/90 via-amber-100/80 to-rose-100/90 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="cartoon-sticker bg-amber-400 text-slate-950">
                            👋 Welcome
                        </span>
                        <span className="cartoon-badge bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                            Role: {user?.role || "STUDENT"}
                        </span>
                        {statsData?.meta?.departmentName && (
                            <span className="cartoon-badge bg-sky-200 text-slate-950">
                                🏛️ {statsData.meta.departmentName}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Hey, {user?.name || "Campus Leader"}!
                    </h1>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mt-1 font-medium">
                        Here's your live operational briefing for campus events & venue allocations today.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {user?.role !== 'STUDENT' && user?.role !== 'DSW' && (
                        <Link
                            href="/dashboard/events/create"
                            className="cartoon-btn bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 text-sm font-black shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#818cf8]"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Submit Event Proposal
                        </Link>
                    )}
                </div>
            </div>

            {/* Playful Neo-Brutalist Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                    <Link
                        key={index}
                        href={stat.link}
                        className={`cartoon-card cartoon-card-hover p-5 ${stat.bgCard} block group`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center`}>
                                {(stat as any).isImage && (stat as any).imageUrl ? (
                                    <img src={(stat as any).imageUrl} alt="Club Logo" className="h-7 w-7 object-cover rounded-xl" />
                                ) : (
                                    <stat.icon className="h-6 w-6 text-slate-950" />
                                )}
                            </div>
                            <span className="cartoon-sticker text-[10px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                                {stat.tag}
                            </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-amber-400 transition-colors">
                            {stat.value}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                            {stat.title}
                        </p>
                    </Link>
                ))}
            </div>

            {/* Two Column Grid: Upcoming Events & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Upcoming Events Box */}
                <div className="lg:col-span-2 cartoon-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-amber-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center font-black text-sm">
                                📅
                            </span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Upcoming Events</h3>
                        </div>
                        <Link
                            href="/dashboard/events"
                            className="cartoon-btn bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 text-xs font-black hover:bg-amber-300 hover:text-slate-950"
                        >
                            View All Events →
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentEvents.length === 0 ? (
                            <div className="cartoon-card p-8 text-center bg-slate-50 dark:bg-slate-950/40 border-dashed border-2">
                                <p className="text-slate-400 font-bold">No approved upcoming events scheduled yet.</p>
                            </div>
                        ) : (
                            recentEvents.map((event: any) => (
                                <Link
                                    key={event.id}
                                    href={`/dashboard/events/${event.id}`}
                                    className="flex items-center gap-4 p-3.5 rounded-2xl cartoon-card cartoon-card-hover bg-slate-50 dark:bg-slate-950/50 group"
                                >
                                    {/* Cartoon Calendar Stamp */}
                                    <div className="w-14 h-14 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex flex-col items-center justify-center flex-shrink-0">
                                        <span className="text-base font-black text-slate-950 leading-none">
                                            {new Date(event.startDateTime).getDate()}
                                        </span>
                                        <span className="text-[10px] font-black uppercase text-slate-800">
                                            {new Date(event.startDateTime).toLocaleString('default', { month: 'short' })}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-base text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-amber-400 transition-colors">
                                            {event.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                {event.club?.name || "Independent Department Event"}
                                            </span>
                                            <span className="cartoon-badge bg-emerald-200 text-slate-950 text-[10px] py-0 px-2">
                                                {event.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-900 flex items-center justify-center group-hover:bg-amber-300 transition-colors flex-shrink-0">
                                        <ArrowUpRight className="h-4 w-4 text-slate-950 dark:text-white group-hover:text-slate-950" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Notifications & Action Items */}
                <div className="cartoon-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-rose-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center font-black text-sm">
                                🔔
                            </span>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Alerts</h3>
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearNotifications}
                                className="cartoon-btn bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 text-xs font-black hover:bg-rose-200 hover:text-slate-950"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                                <span className="text-4xl mb-2">🎉</span>
                                <p className="text-sm font-black text-slate-800 dark:text-slate-200">All caught up!</p>
                                <p className="text-xs font-medium text-slate-500">No urgent action items waiting for you.</p>
                            </div>
                        ) : (
                            notifications.map((notif, i) => (
                                <Link
                                    key={i}
                                    href={notif.link || '#'}
                                    onClick={() => handleDismiss(notif.id)}
                                    className="cartoon-card p-3.5 bg-amber-50/60 dark:bg-slate-950/60 block hover:bg-amber-100 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="cartoon-sticker text-[9px] bg-rose-300 text-slate-950">
                                            Action Needed
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">{notif.time || "Just now"}</span>
                                    </div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white mt-2">{notif.title}</p>
                                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-0.5">{notif.desc}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
