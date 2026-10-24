'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    Building2,
    CheckCircle2,
    Trophy,
    Award,
    DollarSign,
    Image as ImageIcon,
    FileText,
    ExternalLink,
    Printer,
    Sparkles,
    AlertCircle,
    FileSpreadsheet,
    Share2
} from 'lucide-react';
import { API_URL } from '@/config/api';

export default function ReportDetailPage({ params }: { params: { id: string } }) {
    const { token } = useAuth();
    const searchParams = useSearchParams();
    const [reportId, setReportId] = useState<string>('');
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const backUrl = searchParams.get('backUrl') || '/dashboard/reports';
    const backLabel = searchParams.get('backUrl') ? 'Back to Club' : 'Back to Reports';

    useEffect(() => {
        Promise.resolve(params).then((p) => {
            setEventReportId(p.id);
        });
    }, [params, token]);

    const setEventReportId = async (id: string) => {
        setReportId(id);
        if (token) fetchReport(id);
    };

    const fetchReport = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/api/reports/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setReport(data);
            } else {
                setError('Report not found or access denied.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load report dossier.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center comic-dots">
                <div className="w-14 h-14 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] animate-bounce flex items-center justify-center p-2 mb-3">
                    <Sparkles className="w-7 h-7 text-slate-900 animate-spin" />
                </div>
                <div className="cartoon-sticker bg-indigo-300 text-slate-950 text-xs">
                    Compiling Official Activity Report...
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="p-8 max-w-lg mx-auto text-center">
                <div className="cartoon-card bg-rose-100 p-8 space-y-3">
                    <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
                    <h2 className="text-xl font-black text-rose-950">Report Unavailable</h2>
                    <p className="text-xs text-rose-800">
                        {error || 'This activity report record could not be found or you lack read privileges.'}
                    </p>
                    <Link
                        href="/dashboard/reports"
                        className="cartoon-btn bg-slate-900 text-white px-4 py-2 text-xs font-black inline-block mt-2"
                    >
                        Back to Reports Directory
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16 max-w-5xl mx-auto animate-fade-in">

            {/* Top Navigation & Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href={backUrl}
                        className="cartoon-btn bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-900 dark:text-white px-3.5 py-2 text-xs font-black"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        {backLabel}
                    </Link>
                    <span className="cartoon-sticker bg-emerald-300 text-slate-950 text-xs">
                        Report #{report.id}
                    </span>
                </div>
            </div>

            {/* Official MITS Institutional Letterhead Banner */}
            <div className="cartoon-card bg-white p-2 sm:p-4 overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-24 sm:h-32 md:h-36 max-w-4xl">
                    <Image
                        src="/report-header.png"
                        alt="Madhav Institute of Technology & Science"
                        fill
                        priority
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Event Activity Report Hero Card */}
            <div className="cartoon-card bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 p-6 sm:p-8 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="cartoon-sticker bg-emerald-400 text-slate-950 text-xs flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Officially Archived Activity Report
                            </span>
                            {report.submittedOn && (
                                <span className="cartoon-sticker bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                                    Sanctioned on {new Date(report.submittedOn).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                            {report.event?.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                            {report.event?.club && (
                                <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                                    <Building2 className="w-4 h-4" />
                                    <span>{report.event.club.name}</span>
                                </span>
                            )}

                            <span className="text-slate-400 hidden sm:inline">•</span>

                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span>Executed on {new Date(report.event?.startDateTime || report.submittedOn).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex w-20 h-20 rounded-3xl bg-emerald-300 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] items-center justify-center text-4xl shrink-0 animate-wiggle">
                        🏆
                    </div>
                </div>

                {/* Metric Quick Stats Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t-2 border-slate-200/80 dark:border-slate-800">
                    <div className="p-3 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-950">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Total Footfall
                        </span>
                        <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                            {report.numberOfAttendees || 0}
                        </span>
                    </div>

                    <div className="p-3 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-950">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Active Contestants
                        </span>
                        <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                            {report.numberOfParticipants || 0}
                        </span>
                    </div>

                    <div className="p-3 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-950">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Total Expenditure
                        </span>
                        <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            ₹ {Number(report.totalExpenditure || 0).toLocaleString('en-IN')}
                        </span>
                    </div>

                    <div className="p-3 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-950">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Winners Awarded
                        </span>
                        <span className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                            {report.winners?.length || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* Narrative & Objectives */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Executive Overview */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-3">
                    <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                        1. Executive Overview & Proceedings 📝
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap pt-2">
                        {report.overview || "No detailed overview recorded."}
                    </p>
                </div>

                {/* Stated Objectives & Outcomes */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-3">
                    <span className="cartoon-sticker bg-indigo-200 text-slate-950 text-xs">
                        2. Goals & Academic Outcomes 🎯
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap pt-2">
                        {report.objective || "All stated objectives were achieved as per college guild guidelines."}
                    </p>
                </div>
            </div>

            {/* Accolades & Competition Winners */}
            {report.winners && Array.isArray(report.winners) && report.winners.length > 0 && (
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between">
                        <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                            3. Competition Winners 🥇
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                            {report.winners.length} Awarded Entries
                        </span>
                    </div>

                    {(() => {
                        const groupedWinners: { [key: string]: any[] } = {};
                        report.winners.forEach((w: any) => {
                            const cat = w.category || 'General Track';
                            if (!groupedWinners[cat]) groupedWinners[cat] = [];
                            groupedWinners[cat].push(w);
                        });

                        return (
                            <div className="space-y-6 pt-2">
                                {Object.entries(groupedWinners).map(([category, winners], catIdx) => (
                                    <div key={catIdx} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="cartoon-sticker bg-purple-200 text-slate-950 text-xs">
                                                Track: {category}
                                            </span>
                                        </div>

                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {winners
                                                .sort((a, b) => Number(a.position) - Number(b.position))
                                                .map((w: any, idx: number) => {
                                                    const pos = Number(w.position);
                                                    const badgeBg =
                                                        pos === 1
                                                            ? 'bg-amber-300 text-slate-950'
                                                            : pos === 2
                                                            ? 'bg-slate-200 text-slate-950'
                                                            : pos === 3
                                                            ? 'bg-orange-200 text-slate-950'
                                                            : 'bg-indigo-100 text-slate-950';

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="p-4 rounded-xl border-2 border-slate-900 bg-amber-50/50 dark:bg-slate-950 shadow-[3px_3px_0px_#0f172a] space-y-2 flex flex-col justify-between"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className={`cartoon-sticker text-[10px] ${badgeBg}`}>
                                                                        {pos === 1 ? '🥇 1st Place' : pos === 2 ? '🥈 2nd Place' : pos === 3 ? '🥉 3rd Place' : `Rank #${pos}`}
                                                                    </span>
                                                                    <span className="cartoon-sticker bg-white dark:bg-slate-800 text-[10px] py-0.5">
                                                                        {w.type || 'INDIVIDUAL'}
                                                                    </span>
                                                                </div>
                                                                <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">
                                                                    {w.name}
                                                                </h4>
                                                            </div>

                                                            {w.contact && (
                                                                <div className="pt-2 border-t-2 border-dashed border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500">
                                                                    Reg/Roll: {w.contact}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Verifiable Institutional Evidence & Drive Folders */}
            <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4">
                <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-xs">
                    4. Verifiable Institutional Drive Proofs 📂
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    High-resolution cloud folders and validated document records for institutional audits & NIRF/NAAC reports.
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                    {report.photoLink ? (
                        <a
                            href={report.photoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 rounded-xl border-2 border-slate-900 bg-sky-50 dark:bg-sky-950/40 shadow-[3px_3px_0px_#0f172a] hover:bg-sky-100 transition-all flex flex-col justify-between group"
                        >
                            <div className="space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-sky-200 border-2 border-slate-900 flex items-center justify-center text-sky-950">
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                    Event Photographs
                                </h4>
                                <p className="text-[10px] text-slate-500">
                                    Drive folder of inaugural, sessions & valedictory
                                </p>
                            </div>
                            <span className="cartoon-btn bg-white dark:bg-slate-800 text-sky-950 dark:text-sky-200 text-[10px] py-1 mt-3 text-center font-black block shadow-[2px_2px_0px_#0f172a]">
                                Open Drive ↗
                            </span>
                        </a>
                    ) : null}

                    {report.posterLink ? (
                        <a
                            href={report.posterLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 rounded-xl border-2 border-slate-900 bg-purple-50 dark:bg-purple-950/40 shadow-[3px_3px_0px_#0f172a] hover:bg-purple-100 transition-all flex flex-col justify-between group"
                        >
                            <div className="space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-purple-200 border-2 border-slate-900 flex items-center justify-center text-purple-950">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                    Official Creative Poster
                                </h4>
                                <p className="text-[10px] text-slate-500">
                                    High-res approved marketing flyer & schedule
                                </p>
                            </div>
                            <span className="cartoon-btn bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-200 text-[10px] py-1 mt-3 text-center font-black block shadow-[2px_2px_0px_#0f172a]">
                                View File ↗
                            </span>
                        </a>
                    ) : null}

                    {report.attendanceSheetLink ? (
                        <a
                            href={report.attendanceSheetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 rounded-xl border-2 border-slate-900 bg-emerald-50 dark:bg-emerald-950/40 shadow-[3px_3px_0px_#0f172a] hover:bg-emerald-100 transition-all flex flex-col justify-between group"
                        >
                            <div className="space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-emerald-200 border-2 border-slate-900 flex items-center justify-center text-emerald-950">
                                    <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                    Attendance Register
                                </h4>
                                <p className="text-[10px] text-slate-500">
                                    Verified attendance sheet with enrollment records
                                </p>
                            </div>
                            <span className="cartoon-btn bg-white dark:bg-slate-800 text-emerald-950 dark:text-emerald-200 text-[10px] py-1 mt-3 text-center font-black block shadow-[2px_2px_0px_#0f172a]">
                                View Sheet ↗
                            </span>
                        </a>
                    ) : null}

                    {report.certificateLink ? (
                        <a
                            href={report.certificateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 rounded-xl border-2 border-slate-900 bg-amber-50 dark:bg-amber-950/40 shadow-[3px_3px_0px_#0f172a] hover:bg-amber-100 transition-all flex flex-col justify-between group"
                        >
                            <div className="space-y-2">
                                <div className="w-10 h-10 rounded-xl bg-amber-200 border-2 border-slate-900 flex items-center justify-center text-amber-950">
                                    <Award className="w-5 h-5" />
                                </div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                    Certificates Dispatched
                                </h4>
                                <p className="text-[10px] text-slate-500">
                                    Dispatched certificate & IDs
                                </p>
                            </div>
                            <span className="cartoon-btn bg-white dark:bg-slate-800 text-amber-950 dark:text-amber-200 text-[10px] py-1 mt-3 text-center font-black block shadow-[2px_2px_0px_#0f172a]">
                                View List ↗
                            </span>
                        </a>
                    ) : null}
                </div>
            </div>

            {/* Financial Reconciliation & Remarks */}
            <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4">
                <span className="cartoon-sticker bg-emerald-300 text-slate-950 text-xs">
                    5. Financial Statement & Vouchers 💰
                </span>

                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                    <div className="p-4 rounded-xl border-2 border-slate-900 bg-emerald-50/50 dark:bg-slate-950 shadow-[2px_2px_0px_#0f172a]">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">
                            Total Realized Expenditure
                        </span>
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            ₹ {Number(report.totalExpenditure || 0).toLocaleString('en-IN')}
                        </span>
                        {report.expenditureComment && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                {report.expenditureComment}
                            </p>
                        )}
                    </div>

                    {report.billsDriveLink && (
                        <div className="p-4 rounded-xl border-2 border-slate-900 bg-white dark:bg-slate-950 shadow-[2px_2px_0px_#0f172a] flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 block">
                                    Scanned Vouchers & Receipts Folder
                                </span>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                                    Audited invoices stamped by Faculty Advisor
                                </p>
                            </div>
                            <a
                                href={report.billsDriveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cartoon-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black py-2 text-center mt-3 block shadow-[2px_2px_0px_#0f172a]"
                            >
                                Open Audited Receipts ↗
                            </a>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
