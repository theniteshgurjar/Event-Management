'use client';

import React, { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    FileText,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Image as ImageIcon,
    ExternalLink,
    Calendar,
    Sparkles,
    Search,
    Building2,
    DollarSign,
    Filter,
    FolderOpen,
    Users
} from 'lucide-react';
import { API_URL } from '@/config/api';

interface Event {
    id: number;
    title: string;
    status: string;
    startDateTime: string;
    report?: any;
    club: { name: string; id?: number };
}

export default function ReportsPage() {
    const { user, token } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClub, setSelectedClub] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const eventsRes = await fetch(`${API_URL}/api/events`);
                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    setEvents(eventsData);
                }

                if (token && ['ADMIN', 'DSW', 'FACULTY', 'CLUB_COORDINATOR', 'HOD'].includes(user?.role || '')) {
                    const reportsRes = await fetch(`${API_URL}/api/reports`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (reportsRes.ok) {
                        const reportsData = await reportsRes.json();
                        setReports(reportsData);
                    }
                }
            } catch (error) {
                console.error("Error fetching report data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();

    }, [user, token]);

    const pendingReports = events.filter(e => {
        const isApproved = e.status === 'APPROVED';
        const hasNoReport = !e.report;

        if (!isApproved || !hasNoReport) return false;

        // DSW cannot submit reports, only reviews them
        if (user?.role === 'DSW') return false;
        if (user?.role === 'ADMIN') return true;

        const eClubId = (e as any).club?.id;
        const eAdvisorId = (e as any).club?.facultyAdvisorId;
        const eCoordinatorId = (e as any).coordinatorId;

        if (user?.role === 'CLUB_COORDINATOR') {
            const userClubId = (user as any).clubId;
            return userClubId && eClubId && Number(userClubId) === Number(eClubId);
        }

        if (user?.role === 'FACULTY') {
            const userId = Number(user.id);
            return (eCoordinatorId && Number(eCoordinatorId) === userId) ||
                (eAdvisorId && Number(eAdvisorId) === userId);
        }

        return false;
    });

    const filteredReports = reports.filter(r => {
        const matchesClub = !selectedClub || r.event?.club?.name === selectedClub;
        const matchesSearch = !searchQuery.trim() || 
            r.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.overview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.event?.club?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesClub && matchesSearch;
    });

    const uniqueClubs = Array.from(new Set(reports.map(r => r.event?.club?.name).filter(Boolean)));

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center comic-dots">
                <div className="w-14 h-14 rounded-2xl bg-emerald-300 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] animate-bounce flex items-center justify-center p-2 mb-3">
                    <FileText className="w-7 h-7 text-slate-900" />
                </div>
                <div className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                    Loading Campus Activity Archives...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16 max-w-6xl mx-auto animate-fade-in">

            {/* Official MITS Institutional Letterhead Banner */}
            <div className="cartoon-card bg-white p-2 sm:p-4 overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-24 sm:h-32 md:h-36 max-w-4xl">
                    <NextImage
                        src="/report-header.png"
                        alt="Madhav Institute of Technology & Science"
                        fill
                        priority
                        className="object-contain"
                    />
                </div>
            </div>


            {/* Pending Documentation Action Tray (Guarded - DSW doesn't submit reports) */}
            {pendingReports.length > 0 && (
                <div className="cartoon-card p-6 bg-amber-50/80 dark:bg-slate-900 border-amber-400 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-900">
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-amber-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center font-black text-base shrink-0">
                                ⚠️
                            </span>
                            <div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none">
                                    Action Required: Pending Event Documentation ({pendingReports.length})
                                </h2>
                                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 mt-0.5">
                                    Approved campus activities awaiting final report & receipt submission
                                </p>
                            </div>
                        </div>
                        <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs self-start sm:self-auto">
                            Immediate Action
                        </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-1">
                        {pendingReports.map(event => (
                            <div
                                key={event.id}
                                className="cartoon-card p-4 bg-white dark:bg-slate-950 flex flex-col justify-between shadow-[3px_3px_0px_#0f172a]"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="cartoon-sticker text-[9px] bg-sky-200 text-slate-950 py-0.5">
                                            {event.club?.name || 'Authorized Council'}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400">
                                            #{event.id}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                                        {event.title}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 pt-1">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        <span>
                                            {new Date(event.startDateTime).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <Link
                                        href={`/dashboard/reports/create/${event.id}`}
                                        className="cartoon-btn w-full bg-amber-400 hover:bg-amber-300 text-slate-950 py-2 text-xs font-black shadow-[2px_2px_0px_#0f172a] text-center block"
                                    >
                                        Draft Activity Report 🚀
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="cartoon-card bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by event title, club, or narrative..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500 hidden sm:inline" />
                    <select
                        value={selectedClub}
                        onChange={(e) => setSelectedClub(e.target.value)}
                        className="text-xs font-black rounded-xl border-2 border-slate-900 bg-slate-50 dark:bg-slate-950 py-2 px-3 text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                        <option value="">All Clubs & Councils ({reports.length})</option>
                        {uniqueClubs.map(club => (
                            <option key={club} value={club}>{club}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Submitted Reports Archive Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-emerald-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center font-black text-sm">
                            🏛️
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                            Archived Activity Reports ({filteredReports.length})
                        </h2>
                    </div>
                </div>

                {filteredReports.length === 0 ? (
                    <div className="cartoon-card p-12 text-center bg-white dark:bg-slate-900 space-y-3">
                        <FolderOpen className="w-12 h-12 text-slate-400 mx-auto" />
                        <h3 className="font-black text-slate-800 dark:text-slate-200 text-base">
                            No Archived Reports Match Your Criteria
                        </h3>
                        <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                            Try adjusting your search terms or clearing the club filter to view all archived activity reports.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {filteredReports.map((report: any) => (
                            <div
                                key={report.id}
                                className="cartoon-card bg-white dark:bg-slate-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-[6px_6px_0px_#0f172a] transition-all"
                            >
                                <div className="space-y-3 max-w-3xl flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="cartoon-sticker text-[10px] bg-indigo-200 text-slate-950 py-0.5">
                                            {report.event?.club?.name || 'Independent Event'}
                                        </span>
                                       
                                        {report.submittedOn && (
                                            <span className="text-[10px] font-bold text-slate-400">
                                                Archived on {new Date(report.submittedOn).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                        {report.event?.title}
                                    </h3>

                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                        {report.overview || "Executive activity report and evidence dossier sanctioned by student council."}
                                    </p>

                                    {/* Proof Links Pills */}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {report.photoLink && (
                                            <a
                                                href={report.photoLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cartoon-btn bg-sky-100 hover:bg-sky-200 text-sky-950 px-3 py-1 text-[11px] font-black inline-flex items-center gap-1 shadow-[2px_2px_0px_#0f172a]"
                                            >
                                                <ImageIcon className="h-3 w-3" /> Event Photos ↗
                                            </a>
                                        )}
                                        {report.posterLink && (
                                            <a
                                                href={report.posterLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cartoon-btn bg-purple-100 hover:bg-purple-200 text-purple-950 px-3 py-1 text-[11px] font-black inline-flex items-center gap-1 shadow-[2px_2px_0px_#0f172a]"
                                            >
                                                <ExternalLink className="h-3 w-3" /> Official Poster ↗
                                            </a>
                                        )}
                                        {report.numberOfAttendees ? (
                                            <span className="cartoon-sticker bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] py-1">
                                                👥 {report.numberOfAttendees} Turnout
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 flex-shrink-0 pt-3 md:pt-0 border-t-2 md:border-t-0 border-slate-100 dark:border-slate-800">
                                    <div className="text-left md:text-right">
                                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                                            Verified Expenditure
                                        </span>
                                        <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                                            ₹ {Number(report.totalExpenditure || 0).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/dashboard/reports/${report.id}`}
                                        className="cartoon-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a] inline-flex items-center gap-1.5"
                                    >
                                        See Report <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
