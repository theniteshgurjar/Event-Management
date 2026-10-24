'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    Building2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Sparkles,
    Award,
    FileText,
    Send,
    Tag,
    Globe2,
    ShieldCheck,
    MessageSquare,
    Printer,
    Check,
    X,
    Loader2
} from 'lucide-react';
import { API_URL } from '@/config/api';

export const dynamic = 'force-dynamic';

export default function EventDetailPage({ params }: { params: { id: string } }) {
    const { user, token } = useAuth();
    const nextSearchParams = useSearchParams();
    const fromSource = nextSearchParams.get('from');

    const [eventId, setEventId] = useState<string>('');
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Approval Modal State
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
    const [approvalRemark, setApprovalRemark] = useState('');
    const [forwardToDSW, setForwardToDSW] = useState(true);
    const [actionError, setActionError] = useState('');

    const backUrl = nextSearchParams.get('backUrl') || (fromSource === 'approvals' ? '/dashboard/approvals' : '/dashboard/events');
    const backLabel = nextSearchParams.get('backUrl') ? 'Back to Club' : (fromSource === 'approvals' ? 'Back to Approvals' : 'Back to Events');

    useEffect(() => {
        Promise.resolve(params).then((p) => {
            setEventId(p.id);
            fetchEventDetails(p.id);
        });
    }, [params]);

    const fetchEventDetails = async (id: string) => {
        try {
            const headers: any = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/api/events/${id}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setEvent(data);
            }
        } catch (error) {
            console.error('Failed to fetch event:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (approvalAction === 'REJECTED' && !approvalRemark.trim()) {
            setActionError('Please provide a reason for rejection.');
            return;
        }

        setActionLoading(true);
        setActionError('');

        try {
            const res = await fetch(`${API_URL}/api/events/${eventId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: approvalAction,
                    remarks: approvalRemark.trim() || (approvalAction === 'APPROVED' ? 'Sanctioned via Event Dossier Desk' : 'Proposal rejected'),
                    forwardToDSW: user?.role === 'HOD' ? forwardToDSW : false
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update approval status');
            }

            setShowApprovalModal(false);
            setApprovalRemark('');
            // Refresh details
            fetchEventDetails(eventId);
        } catch (err: any) {
            setActionError(err.message || 'Error executing action');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    };

    const formatTimeOnly = (dateString: string) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center comic-dots">
                <div className="w-14 h-14 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] animate-bounce flex items-center justify-center p-2 mb-3">
                    <Sparkles className="w-7 h-7 text-slate-900 animate-spin" />
                </div>
                <div className="cartoon-sticker bg-indigo-300 text-slate-950 text-xs">
                    Fetching Event Details...
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="p-8 max-w-lg mx-auto text-center">
                <div className="cartoon-card bg-rose-100 p-8">
                    <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
                    <h2 className="text-xl font-black text-rose-950 mb-2">Event Details Not Found</h2>
                    <p className="text-xs text-rose-800 mb-4">
                        The requested event record does not exist or access has been restricted.
                    </p>
                    <Link href="/dashboard/events" className="cartoon-btn bg-slate-900 text-white px-4 py-2 text-xs font-black inline-block">
                        Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    if (user?.role === 'STUDENT' && event.status !== 'APPROVED' && event.status !== 'COMPLETED') {
        return (
            <div className="p-8 max-w-lg mx-auto text-center space-y-4">
                <div className="cartoon-card bg-amber-100 p-8 space-y-3">
                    <AlertCircle className="w-12 h-12 text-amber-700 mx-auto" />
                    <h2 className="text-xl font-black text-amber-950">Event Under Review</h2>
                    <p className="text-xs text-amber-900 font-medium">
                        This event proposal is currently under administrative review and has not yet been approved. Students can only view officially approved campus events.
                    </p>
                    <Link href="/dashboard/events" className="cartoon-btn bg-slate-900 text-white px-4 py-2 text-xs font-black inline-block mt-2">
                        View Approved Events
                    </Link>
                </div>
            </div>
        );
    }

    // Role-based actions
    const isApproved = event.status === 'APPROVED';
    const isRejected = event.status === 'REJECTED';
    const isPendingHOD = event.status === 'PENDING_HOD_APPROVAL';
    const isPendingDSW = event.status === 'PENDING_DSW_APPROVAL';
    const isPendingAdvisor = event.status === 'PENDING';

    const canUserApprove = (() => {
        if (!user) return false;
        if (user.role === 'ADMIN') return isPendingHOD || isPendingDSW || isPendingAdvisor;
        if (user.role === 'HOD' && isPendingHOD) return true;
        if (user.role === 'DSW' && isPendingDSW) return true;
        return false;
    })();

    const canSubmitReport = (() => {
        if (!isApproved) return false;
        if (event.report) return false; // already submitted
        if (user?.role === 'DSW') return false; // DSW does not submit reports

        const eClubId = event.club?.id;
        const eAdvisorId = event.club?.facultyAdvisorId;
        const eCoordinatorId = event.coordinatorId || event.coordinator?.id;
        const collaboratorIds = event.collaborators?.map((c: any) => Number(c.id)) || [];

        if (user?.role === 'ADMIN') return true;

        if (user?.role === 'CLUB_COORDINATOR') {
            const userClubId = (user as any).clubId;
            if (!userClubId) return false;
            return (eClubId && Number(userClubId) === Number(eClubId)) || collaboratorIds.includes(Number(userClubId));
        }

        if (user?.role === 'FACULTY') {
            const userId = Number(user.id);
            if (eCoordinatorId && Number(eCoordinatorId) === userId) return true;
            if (eAdvisorId && Number(eAdvisorId) === userId) return true;
            const collaboratingAdvisorIds = event.collaborators?.map((c: any) => Number(c.facultyAdvisorId)) || [];
            if (collaboratingAdvisorIds.includes(userId)) return true;
        }

        return false;
    })();

    return (
        <div className="space-y-8 pb-16 max-w-5xl mx-auto">
            
            {/* Top Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href={backUrl}
                        className="cartoon-btn bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-900 dark:text-white px-3.5 py-2 text-xs font-black"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        {backLabel}
                    </Link>
                    <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-xs">
                        Ref #{event.id}
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    
                    {event.report && (
                        <Link
                            href={`/dashboard/reports/${event.report.id}`}
                            className="cartoon-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                        >
                            <FileText className="w-3.5 h-3.5 mr-1.5 inline" />
                            View Submitted Report 📑
                        </Link>
                    )}

                    {canSubmitReport && (
                        <Link
                            href={`/dashboard/reports/create/${event.id}`}
                            className="cartoon-btn bg-orange-400 hover:bg-orange-300 text-slate-950 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                        >
                            <Award className="w-3.5 h-3.5 mr-1.5 inline" />
                            Submit Activity Report 🏆
                        </Link>
                    )}

                    {canUserApprove && (
                        <button
                            onClick={() => {
                                setApprovalAction('APPROVED');
                                setShowApprovalModal(true);
                            }}
                            className="cartoon-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 inline" />
                            Review & Approval ⚡
                        </button>
                    )}
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

            {/* Event Hero Identity Banner */}
            <div className="cartoon-card bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30 p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Status Sticker */}
                            {user?.role === 'STUDENT' ? (
                                <span className="cartoon-sticker bg-emerald-400 text-slate-950 text-xs flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Approved Campus Event
                                </span>
                            ) : (
                                <>
                                    {isApproved && (
                                        <span className="cartoon-sticker bg-emerald-400 text-slate-950 text-xs flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Officially Approved
                                        </span>
                                    )}
                                    {isRejected && (
                                        <span className="cartoon-sticker bg-rose-400 text-slate-950 text-xs flex items-center gap-1">
                                            <XCircle className="w-3.5 h-3.5" />
                                            Proposal Rejected
                                        </span>
                                    )}
                                    {isPendingHOD && (
                                        <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            Awaiting HOD Approval
                                        </span>
                                    )}
                                    {isPendingDSW && (
                                        <span className="cartoon-sticker bg-indigo-300 text-slate-950 text-xs flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Awaiting DSW Approval
                                        </span>
                                    )}
                                    {isPendingAdvisor && (
                                        <span className="cartoon-sticker bg-yellow-300 text-slate-950 text-xs flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            Faculty Advisor Review
                                        </span>
                                    )}
                                </>
                            )}

                            {event.mainCategory && (
                                <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-xs">
                                    {event.mainCategory}
                                </span>
                            )}

                            {event.subCategory && (
                                <span className="cartoon-sticker bg-purple-200 text-slate-950 text-xs">
                                    {event.subCategory}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                            {event.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                            {event.club && (
                                <Link
                                    href={`/dashboard/clubs/${event.club.id}`}
                                    className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 hover:underline"
                                >
                                    <Building2 className="w-4 h-4" />
                                    <span>{event.club.name}</span>
                                </Link>
                            )}

                            {event.collaborators && event.collaborators.length > 0 && (
                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                    <span>with</span>
                                    {event.collaborators.map((c: any) => (
                                        <span key={c.id} className="cartoon-sticker bg-white dark:bg-slate-800 text-[10px] py-0.5 px-2">
                                            {c.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <span className="text-slate-400 hidden sm:inline">•</span>

                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span>{formatDate(event.startDateTime)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex w-20 h-20 rounded-3xl bg-amber-300 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] items-center justify-center text-4xl shrink-0 animate-wiggle">
                        🏛️
                    </div>
                </div>
            </div>

            {/* Multi-Tier Approval Pipeline Tracker (Admin, HOD, DSW, Faculty, Coordinator only) */}
            {user?.role !== 'STUDENT' && (
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                            Institutional Governance Pipeline
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                            {isApproved ? 'All Approvals Cleared' : isRejected ? 'Process Terminated' : 'Under Review'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                        {/* Stage 1: Drafting */}
                        <div className="p-3 rounded-xl border-2 border-slate-900 bg-emerald-100 dark:bg-emerald-950/40 text-slate-950 dark:text-white">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Stage 1</span>
                                <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                            </div>
                            <p className="text-xs font-black">Proposal Drafted</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400">Submitted by Coordinator</p>
                        </div>

                        {/* Stage 2: HOD */}
                        <div className={`p-3 rounded-xl border-2 border-slate-900 ${
                            isApproved || isPendingDSW
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-slate-950 dark:text-white'
                                : isPendingHOD
                                ? 'bg-amber-100 dark:bg-amber-950/40 text-slate-950 dark:text-white ring-2 ring-amber-400'
                                : isRejected
                                ? 'bg-rose-100 dark:bg-rose-950/40 text-slate-950 dark:text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider">Stage 2</span>
                                {(isApproved || isPendingDSW) && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                                {isPendingHOD && <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />}
                                {isRejected && <X className="w-3.5 h-3.5 text-rose-700" />}
                            </div>
                            <p className="text-xs font-black">HOD Approval</p>
                            <p className="text-[10px] opacity-80">Department Audit</p>
                        </div>

                        {/* Stage 3: DSW */}
                        <div className={`p-3 rounded-xl border-2 border-slate-900 ${
                            isApproved
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-slate-950 dark:text-white'
                                : isPendingDSW
                                ? 'bg-indigo-100 dark:bg-indigo-950/40 text-slate-950 dark:text-white ring-2 ring-indigo-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider">Stage 3</span>
                                {isApproved && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                                {isPendingDSW && <Clock className="w-3.5 h-3.5 text-indigo-700 animate-spin" />}
                            </div>
                            <p className="text-xs font-black">DSW Final Clearance</p>
                            <p className="text-[10px] opacity-80">Apex Authorization</p>
                        </div>

                        {/* Stage 4: Execution */}
                        <div className={`p-3 rounded-xl border-2 border-slate-900 ${
                            isApproved
                                ? 'bg-amber-200 dark:bg-amber-900/40 text-slate-950 dark:text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider">Stage 4</span>
                                {isApproved && <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300" />}
                            </div>
                            <p className="text-xs font-black">Event Execution</p>
                            <p className="text-[10px] opacity-80">{event.report ? 'Report Archived' : 'Live Campus Phase'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Audit & Sanction Log (Hidden from normal students) */}
            {user?.role !== 'STUDENT' && event.approvals && event.approvals.length > 0 && (
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-4">
                    <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-xs">
                        Official Decision Log & Remarks ✍️
                    </span>

                    <div className="space-y-3 pt-2">
                        {event.approvals.map((approval: any, idx: number) => {
                            const isRejection = approval.status === 'REJECTED';
                            return (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] ${
                                        isRejection
                                            ? 'bg-rose-50 dark:bg-rose-950/30'
                                            : 'bg-emerald-50 dark:bg-emerald-950/30'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`cartoon-sticker text-[10px] font-black ${
                                                isRejection ? 'bg-rose-400 text-slate-950' : 'bg-emerald-400 text-slate-950'
                                            }`}>
                                                {approval.status}
                                            </span>
                                            <span className="text-xs font-black text-slate-900 dark:text-white">
                                                by {approval.approvedBy?.name || 'Authority'} ({approval.approvedBy?.role})
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                            {formatDate(approval.date)}
                                        </span>
                                    </div>
                                    {approval.remarks && (
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 pl-2 border-l-2 border-slate-900">
                                            "{approval.remarks}"
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Content Layout */}
            <div className="grid gap-8 lg:grid-cols-3">

                {/* Left 2 Cols: Main Dossier Details */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Section 1: Overview & Manifesto */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4">
                        <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                            1. Event Manifesto & Abstract 📜
                        </span>
                        <div className="pt-2">
                            <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line">
                                {event.description}
                            </p>
                        </div>

                        {event.purpose && event.purpose !== 'See Description' && (
                            <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-black uppercase text-slate-500 mb-1">
                                    Educational Purpose & Target Impact
                                </p>
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {event.purpose}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Multi-Day Schedule & Venue Allocation */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="cartoon-sticker bg-indigo-200 text-slate-950 text-xs">
                                2. Schedule & Venue Slots 🗓️
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                                Duration: {event.durationDays ? `${event.durationDays} Day(s)` : 'Single Day'}
                            </span>
                        </div>

                        <div className="space-y-3 pt-2">
                            {event.schedules && event.schedules.length > 0 ? (
                                event.schedules.map((sch: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-xl border-2 border-slate-900 bg-amber-50/50 dark:bg-slate-950 shadow-[2px_2px_0px_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="cartoon-sticker bg-amber-300 text-slate-950 text-[10px] py-0.5">
                                                    Day {sch.dayNumber || idx + 1}
                                                </span>
                                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                                    {sch.venue?.name || 'TBD Auditorium'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                <span>
                                                    {formatTimeOnly(sch.startTime)} – {formatTimeOnly(sch.endTime)}
                                                </span>
                                                <span className="text-slate-400">•</span>
                                                <span>{formatDate(sch.startTime).split(',')[0]}</span>
                                            </div>
                                        </div>

                                        {sch.venue?.capacity && (
                                            <div className="cartoon-sticker bg-white dark:bg-slate-800 text-[10px] self-start sm:self-center">
                                                Capacity: {sch.venue.capacity} seats
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center text-xs font-medium text-slate-500">
                                    Single schedule session: {formatDate(event.startDateTime)} – {formatDate(event.endDateTime)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Dignitaries, Speakers & In-House Guests */}
                    {((event.externalGuests && event.externalGuests.length > 0) || (event.internalGuests && event.internalGuests.length > 0)) && (
                        <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4">
                            <span className="cartoon-sticker bg-purple-200 text-slate-950 text-xs">
                                3. Dignitaries, Speakers & Guests 🎙️
                            </span>

                            <div className="space-y-4 pt-2">
                                {/* External Guests */}
                                {event.externalGuests && Array.isArray(event.externalGuests) && event.externalGuests.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            External Chief Guests & Industry Experts
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {event.externalGuests.map((guest: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="p-3.5 rounded-xl border-2 border-slate-900 bg-purple-50/50 dark:bg-slate-950 shadow-[2px_2px_0px_#0f172a]"
                                                >
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">
                                                        {guest.name}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                                                        {guest.designation}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                                        {guest.organization}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* In-House Dignitaries */}
                                {event.internalGuests && Array.isArray(event.internalGuests) && event.internalGuests.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t-2 border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            Internal Institutional Faculty & HODs
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {event.internalGuests.map((guest: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="p-3.5 rounded-xl border-2 border-slate-900 bg-blue-50/50 dark:bg-slate-950 shadow-[2px_2px_0px_#0f172a]"
                                                >
                                                    <p className="text-xs font-black text-slate-900 dark:text-white">
                                                        {guest.name}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                                                        {guest.role}
                                                    </p>
                                                    <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                                        Dept: {guest.department}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Section 4: Resource Requisitions & Equipment */}
                    {event.requirements && event.requirements.length > 0 && (
                        <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-4">
                            <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-xs">
                                4. Requested Infrastructure & Logistics 🛠️
                            </span>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {event.requirements.map((req: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className="cartoon-sticker bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs py-1 px-3"
                                    >
                                        ✓ {req}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right 1 Col: Institutional Dossier Sidebar */}
                <div className="space-y-6">

                    {/* Host Club Dossier Card */}
                    {event.club && (
                        <div className="cartoon-card bg-amber-50 dark:bg-slate-900 p-5 space-y-3">
                            <span className="cartoon-sticker bg-amber-300 text-slate-950 text-[10px]">
                                Host Organizing Entity
                            </span>
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    {event.club.name}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    Official Student Council
                                </p>
                            </div>
                            <Link
                                href={`/dashboard/clubs/${event.club.id}`}
                                className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-full text-center text-xs font-black py-2 block shadow-[2px_2px_0px_#0f172a]"
                            >
                                View Club Profile ➔
                            </Link>
                        </div>
                    )}

                    {/* Proposer Info Card */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 p-5 space-y-3">
                        <span className="cartoon-sticker bg-emerald-300 text-slate-950 text-[10px]">
                            Proposal Submitter
                        </span>
                        <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white">
                                {event.coordinator?.name || 'Authorized Coordinator'}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500">
                                {event.coordinator?.email || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Target Demographics & Alignment Card */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 p-5 space-y-4">
                        <span className="cartoon-sticker bg-purple-300 text-slate-950 text-[10px]">
                            Classification & SDG Alignment
                        </span>

                        <div className="space-y-3 pt-1">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400">Target Audience</p>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                    {event.targetAudience || 'Open to All Enrolled Students'}
                                </p>
                            </div>

                            {event.sdg && (
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">UN Sustainable Development Goal</p>
                                    <span className="cartoon-sticker bg-emerald-200 text-slate-950 text-[10px] mt-1 inline-block">
                                        🌍 {event.sdg}
                                    </span>
                                </div>
                            )}

                        
                        </div>
                    </div>

                </div>
            </div>

            {/* Approval / Rejection Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
                    <div className="cartoon-card bg-white dark:bg-slate-900 w-full max-w-lg p-6 sm:p-7 shadow-[6px_6px_0px_#0f172a] space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                            <div>
                                <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                                    Administrative Decision
                                </span>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                                    Review Proposal #{event.id}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowApprovalModal(false)}
                                className="cartoon-btn p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {actionError && (
                            <div className="cartoon-card bg-rose-100 border-rose-500 p-3 text-rose-950 font-bold text-xs">
                                {actionError}
                            </div>
                        )}

                        <form onSubmit={handleApprovalSubmit} className="space-y-4">
                            {/* Action Choice Tabs */}
                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1.5">
                                    Select Verdict
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setApprovalAction('APPROVED')}
                                        className={`cartoon-btn py-2 text-xs font-black ${
                                            approvalAction === 'APPROVED'
                                                ? 'bg-emerald-400 text-slate-950 shadow-[3px_3px_0px_#0f172a]'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        ✓ Approve & Sanction
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setApprovalAction('REJECTED')}
                                        className={`cartoon-btn py-2 text-xs font-black ${
                                            approvalAction === 'REJECTED'
                                                ? 'bg-rose-400 text-slate-950 shadow-[3px_3px_0px_#0f172a]'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        ✕ Reject Proposal
                                    </button>
                                </div>
                            </div>

                            {/* HOD Forwarding Option */}
                            {user?.role === 'HOD' && approvalAction === 'APPROVED' && (
                                <div className="p-3 rounded-xl border-2 border-slate-900 bg-indigo-50 dark:bg-indigo-950/30">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={forwardToDSW}
                                            onChange={(e) => setForwardToDSW(e.target.checked)}
                                            className="w-4 h-4 rounded border-2 border-slate-900 text-indigo-600 focus:ring-0"
                                        />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            Forward to Dean Student Welfare (DSW) for Apex Sanction
                                        </span>
                                    </label>
                                    <p className="text-[10px] text-slate-500 mt-1 pl-6">
                                        Recommended for inter-departmental fests, flagship conclaves, or campus auditoriums.
                                    </p>
                                </div>
                            )}

                            {/* Remarks */}
                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1.5">
                                    Official Audit Remarks {approvalAction === 'REJECTED' && <span className="text-rose-600">*</span>}
                                </label>
                                <textarea
                                    rows={3}
                                    value={approvalRemark}
                                    onChange={(e) => setApprovalRemark(e.target.value)}
                                    placeholder={
                                        approvalAction === 'APPROVED'
                                            ? 'e.g. Approved. Auditorium 2 allocated with sound clearance.'
                                            : 'e.g. Schedule clashes with Mid-Sem Examinations. Please reschedule.'
                                    }
                                    className="w-full rounded-xl py-2 px-3 text-xs font-bold bg-slate-50 dark:bg-slate-950 border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    required={approvalAction === 'REJECTED'}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowApprovalModal(false)}
                                    className="cartoon-btn bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-black"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className={`cartoon-btn text-slate-950 px-5 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a] flex items-center gap-1.5 ${
                                        approvalAction === 'APPROVED'
                                            ? 'bg-emerald-400 hover:bg-emerald-300'
                                            : 'bg-rose-400 hover:bg-rose-300'
                                    }`}
                                >
                                    {actionLoading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            Confirm Decision
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
