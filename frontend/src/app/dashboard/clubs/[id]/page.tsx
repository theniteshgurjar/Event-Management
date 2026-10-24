'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';
import {
    Users,
    Mail,
    Phone,
    Calendar,
    Award,
    Edit3,
    ArrowLeft,
    Sparkles,
    Plus,
    FileText,
    CheckCircle2,
    Clock,
    Crown,
    GraduationCap,
    Shield,
    BookOpen,
    ExternalLink
} from 'lucide-react';

export default function ClubDetailPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const [clubId, setClubId] = useState<string>('');
    const [club, setClub] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const canManage = user && club && (
        user.role === 'ADMIN' ||
        user.role === 'DSW' ||
        (club.coordinators && club.coordinators.some((c: any) => Number(c.id) === Number(user.id))) ||
        (['FACULTY', 'HOD'].includes(user.role) && Number(club.facultyAdvisorId) === Number(user.id))
    );

    useEffect(() => {
        Promise.resolve(params).then((p) => {
            setClubId(p.id);
            fetchClubDetails(p.id);
        });
    }, [params]);

    const fetchClubDetails = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/api/clubs/${id}`);
            if (res.ok) {
                const data = await res.json();
                setClub(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] animate-bounce flex items-center justify-center text-2xl mb-4">
                    🎪
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Loading Club Dossier...</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Summoning roster & events</p>
            </div>
        );
    }

    if (!club) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-200 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center text-3xl mb-4">
                    🔍
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Club Not Found</h2>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1 max-w-sm">
                    The requested student organization doesn't exist or may have been archived.
                </p>
                <Link
                    href="/dashboard/clubs"
                    className="cartoon-btn bg-amber-300 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 mt-6 text-sm"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Clubs Directory
                </Link>
            </div>
        );
    }

    // Count leadership roster
    const leadershipCount = [
        club.facultyAdvisor?.name,
        club.president,
        club.treasurer,
        ...(club.vicePresidents || []),
        ...(club.secretaries || [])
    ].filter(Boolean).length;

    return (
        <div className="space-y-8 pb-16 max-w-7xl mx-auto">

            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/clubs"
                        className="cartoon-btn bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-900 dark:text-white px-3.5 py-2 text-xs font-black"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        All Clubs
                    </Link>


                </div>

                <div className="flex items-center gap-3">
                    {canManage && (
                        <Link
                            href={`/dashboard/clubs/${clubId}/manage`}
                            className="cartoon-btn bg-amber-300 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 text-xs"
                        >
                            <Edit3 className="w-4 h-4 mr-1.5" />
                            Manage Team & Info
                        </Link>
                    )}

                </div>
            </div>

            {/* Hero Header Card */}
            <div className="cartoon-card bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-6 sm:p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">

                    {/* Club Brand & Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-300 border-4 border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center overflow-hidden shrink-0">
                            {club.logoUrl ? (
                                <img
                                    src={club.logoUrl}
                                    alt={club.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl sm:text-5xl font-black text-slate-950">
                                    {club.name?.charAt(0) || 'C'}
                                </span>
                            )}
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">

                                {club.departmentId && (
                                    <span className="cartoon-sticker bg-purple-200 text-slate-950 text-[10px]">
                                        Dept Linked
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                {club.name}
                            </h1>
                            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                                <span>Madhav Institute of Technology & Science</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Stat Bento Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
                        <div className="cartoon-card bg-white dark:bg-slate-900 p-3 text-center min-w-[100px]">
                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                {club.events?.length || 0}
                            </div>
                            <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                                Total Events
                            </div>
                        </div>

                        <div className="cartoon-card bg-white dark:bg-slate-900 p-3 text-center min-w-[100px]">
                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                {leadershipCount}
                            </div>
                            <div className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                                Council Seats
                            </div>
                        </div>


                    </div>

                </div>
            </div>

            {/* 2-Column Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: About & Contact */}
                <div className="space-y-6 lg:col-span-1">

                    {/* About Card */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                            <span className="cartoon-sticker bg-yellow-200 text-slate-950 text-xs">
                                📖 About The Club
                            </span>
                            <Sparkles className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {club.description || "No official description provided yet. Update via the Manage Team dashboard."}
                        </p>
                    </div>

                    {/* Official Contact Info Card */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                            <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-xs">
                                📡 Inquiries & Contacts
                            </span>
                            <Mail className="w-4 h-4 text-cyan-600" />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                                    Official Email
                                </label>
                                {club.contactEmail ? (
                                    <a
                                        href={`mailto:${club.contactEmail}`}
                                        className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-slate-900 dark:border-indigo-800"
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                        {club.contactEmail}
                                    </a>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No email registered</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                                    Phone
                                </label>
                                {club.contactPhone ? (
                                    <a
                                        href={`tel:${club.contactPhone}`}
                                        className="inline-flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-900 dark:border-slate-700"
                                    >
                                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                        {club.contactPhone}
                                    </a>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">No phone registered</p>
                                )}
                            </div>

                            {/* Verification Tag */}
                            <div className="pt-2">
                                <div className="cartoon-badge bg-amber-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-[11px] w-full justify-center py-2">
                                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                                    Authorized DSW Student Body
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Linked Faculty Advisor Badge Card */}
                    <div className="cartoon-card bg-indigo-50 dark:bg-indigo-950/30 p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                Faculty Advisor
                            </span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                                {club.facultyAdvisor?.name || "Not Formally Assigned"}
                            </p>
                            {club.facultyAdvisor?.email && (
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                                    {club.facultyAdvisor.email}
                                </p>
                            )}
                            <span className="cartoon-badge bg-indigo-200 text-slate-950 text-[10px] mt-2">
                                Mentor & Proposal Reviewer
                            </span>
                        </div>
                    </div>

                    {/* Student Coordinators (if any) */}
                    {club.coordinators && club.coordinators.length > 0 && (
                        <div className="cartoon-card bg-white dark:bg-slate-900 p-5 space-y-3">
                            <span className="cartoon-sticker bg-emerald-200 text-slate-950 text-xs">
                                👥 Student Coordinators
                            </span>
                            <div className="space-y-2 mt-2">
                                {club.coordinators.map((c: any) => (
                                    <div
                                        key={c.id}
                                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-900 dark:border-slate-700 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white">{c.name}</p>
                                            <p className="text-[11px] font-medium text-slate-500">{c.email}</p>
                                        </div>
                                        <span className="cartoon-badge bg-emerald-300 text-slate-950 text-[9px] py-0.5">
                                            Admin
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Leadership Council & Events */}
                <div className="space-y-8 lg:col-span-2">

                    {/* Executive Leadership Council Bento */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b-2 border-slate-900 dark:border-slate-800">
                            <div>
                                <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                                    👑 Executive Council
                                </span>
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                                Year : {new Date().getFullYear()} - {new Date().getFullYear() + 1}
                            </span>
                        </div>

                        {/* Leadership Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* President */}
                            <div className="cartoon-card bg-amber-50/70 dark:bg-slate-800/80 p-4 border-amber-400 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="cartoon-sticker bg-amber-300 text-slate-950 text-[10px]">
                                            👑 President
                                        </span>
                                        <Crown className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                                        {club.president || "Not Designated"}
                                    </h3>
                                    {club.presidentEnrollment && (
                                        <span className="cartoon-badge bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[10px] mt-2 font-mono">
                                            {club.presidentEnrollment}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Treasurer */}
                            <div className="cartoon-card bg-rose-50/70 dark:bg-slate-800/80 p-4 border-rose-400 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="cartoon-sticker bg-rose-300 text-slate-950 text-[10px]">
                                            💰 Treasurer
                                        </span>
                                        <Award className="w-4 h-4 text-rose-600" />
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                                        {club.treasurer || "Not Designated"}
                                    </h3>
                                    {club.treasurerEnrollment && (
                                        <span className="cartoon-badge bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-[10px] mt-2 font-mono">
                                            {club.treasurerEnrollment}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Vice Presidents */}
                            <div className="cartoon-card bg-cyan-50/70 dark:bg-slate-800/80 p-4 border-cyan-400 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="cartoon-sticker bg-cyan-300 text-slate-950 text-[10px]">
                                            ⚡ Vice President(s)
                                        </span>
                                        <Users className="w-4 h-4 text-cyan-600" />
                                    </div>

                                    {club.vicePresidents && club.vicePresidents.length > 0 ? (
                                        <div className="space-y-2 mt-2">
                                            {club.vicePresidents.map((vp: string, idx: number) => (
                                                <div key={idx} className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-900">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">{vp}</p>
                                                    {club.vicePresidentsEnrollment && club.vicePresidentsEnrollment[idx] && (
                                                        <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
                                                            {club.vicePresidentsEnrollment[idx]}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic mt-2">No Vice Presidents appointed</p>
                                    )}
                                </div>
                            </div>

                            {/* Secretaries */}
                            <div className="cartoon-card bg-emerald-50/70 dark:bg-slate-800/80 p-4 border-emerald-400 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="cartoon-sticker bg-emerald-300 text-slate-950 text-[10px]">
                                            ✍️ Secretary(s)
                                        </span>
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                    </div>

                                    {club.secretaries && club.secretaries.length > 0 ? (
                                        <div className="space-y-2 mt-2">
                                            {club.secretaries.map((sec: string, idx: number) => (
                                                <div key={idx} className="bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-slate-900">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">{sec}</p>
                                                    {club.secretariesEnrollment && club.secretariesEnrollment[idx] && (
                                                        <p className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">
                                                            {club.secretariesEnrollment[idx]}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic mt-2">No Secretaries appointed</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Events & Activities Timeline */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-900 dark:border-slate-800">
                            <div>
                                <span className="cartoon-sticker bg-purple-300 text-slate-950 text-xs">
                                    🎪 Organized Activities
                                </span>
                            </div>
                            <span className="cartoon-badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                                {(club.events || []).filter((e: any) => user?.role !== 'STUDENT' || ['APPROVED', 'COMPLETED'].includes(e.status)).length} Total Events
                            </span>
                        </div>

                        {(() => {
                            const displayEvents = (club.events || []).filter((e: any) => user?.role !== 'STUDENT' || ['APPROVED', 'COMPLETED'].includes(e.status));

                            if (displayEvents.length === 0) {
                                return (
                                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 space-y-3">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] mx-auto flex items-center justify-center text-2xl animate-wiggle">
                                            🎉
                                        </div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                                            No Events Organized Yet!
                                        </h3>
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                                            {user?.role === 'STUDENT'
                                                ? 'No approved events have been published for this club yet. Stay tuned!'
                                                : 'This club is primed for action. Propose a workshop, guest talk, or cultural celebration now.'}
                                        </p>
                                        {user?.role !== 'DSW' && user?.role !== 'STUDENT' && (
                                            <Link
                                                href={`/dashboard/events/create?clubId=${clubId}`}
                                                className="cartoon-btn bg-amber-300 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 text-xs inline-flex mt-2"
                                            >
                                                <Plus className="w-4 h-4 mr-1" />
                                                Propose First Event
                                            </Link>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {displayEvents.map((event: any) => {
                                        const eventDate = new Date(event.startDateTime).toLocaleString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                            timeZone: 'Asia/Kolkata'
                                        });

                                        const isCollab = event.clubId && Number(event.clubId) !== Number(club.id);

                                        return (
                                            <div
                                                key={event.id}
                                                className="cartoon-card bg-slate-50 dark:bg-slate-800/60 p-5 cartoon-card-hover space-y-3"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                                                {event.title}
                                                            </h3>
                                                            {isCollab && (
                                                                <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-[10px]">
                                                                    🤝 Collab Event
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2">
                                                            {event.description || "No description provided."}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 pt-1">
                                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                                            <span>{eventDate}</span>
                                                        </div>
                                                    </div>

                                                    <span className={`cartoon-badge shrink-0 text-xs ${event.status === 'APPROVED' ? 'bg-emerald-300 text-slate-950' :
                                                            event.status === 'COMPLETED' ? 'bg-sky-300 text-slate-950' :
                                                                event.status === 'REJECTED' ? 'bg-rose-300 text-slate-950' :
                                                                    'bg-amber-300 text-slate-950'
                                                        }`}>
                                                        {event.status}
                                                    </span>
                                                </div>

                                                {/* Action Links */}
                                                <div className="pt-3 border-t-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                                                    <Link
                                                        href={`/dashboard/events/${event.id}?backUrl=/dashboard/clubs/${club.id}`}
                                                        className="cartoon-btn bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-900 dark:text-white px-3 py-1.5 text-xs font-black"
                                                    >
                                                        View Event Details →
                                                    </Link>

                                                    {event.report && (
                                                        <Link
                                                            href={`/dashboard/reports/${event.report.id}?backUrl=/dashboard/clubs/${club.id}`}
                                                            className="cartoon-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-3 py-1.5 text-xs font-black"
                                                        >
                                                            <FileText className="w-3.5 h-3.5 mr-1" />
                                                            Submitted Report 📄
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>

                </div>

            </div>

        </div>
    );
}
