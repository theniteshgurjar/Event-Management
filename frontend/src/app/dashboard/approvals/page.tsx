'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { CheckCircle2, XCircle, ArrowUpRight, Clock, Building2, MapPin, Sparkles, X, AlertTriangle } from 'lucide-react';
import { API_URL } from '@/config/api';

interface Event {
    id: number;
    title: string;
    description: string;
    startDateTime: string;
    status: string;
    club?: { name: string } | null;
    department?: { name: string; hodId: number } | null;
    schedules: { venue: { name: string }; dayNumber: number }[];
    coordinator?: { name: string; email: string };
    eventType?: string;
    purpose?: string;
    targetAudience?: string;
}

export default function ApprovalsPage() {
    const { user, token } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const [showActionModal, setShowActionModal] = useState(false);
    const [actionEventId, setActionEventId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
    const [actionRemark, setActionRemark] = useState('');
    const [forwardToDSW, setForwardToDSW] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const headers: any = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/api/events`, { headers });
            if (res.ok) {
                const data = await res.json();

                const filtered = data.filter((e: Event) => {
                    if (user?.role === 'HOD') return e.status === 'PENDING_HOD_APPROVAL';
                    if (user?.role === 'DSW') return e.status === 'PENDING_DSW_APPROVAL';
                    return e.status === 'PENDING_HOD_APPROVAL' || e.status === 'PENDING_DSW_APPROVAL' || e.status === 'PENDING';
                });

                setEvents(filtered);
            }
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    const initiateAction = (eventId: number, type: 'APPROVED' | 'REJECTED') => {
        setActionEventId(eventId);
        setActionType(type);
        setActionRemark('');
        setForwardToDSW(false);
        setShowActionModal(true);
    };

    const confirmAction = async () => {
        if (!actionEventId || !actionType) return;

        if (actionType === 'REJECTED' && !actionRemark.trim()) {
            alert('Please provide a remark for rejection.');
            return;
        }

        await processApproval(actionEventId, actionType, actionRemark.trim() || 'Approved via Dashboard', forwardToDSW);
        setShowActionModal(false);
        setActionEventId(null);
        setActionType(null);
        setActionRemark('');
    };

    const processApproval = async (eventId: number, status: 'APPROVED' | 'REJECTED', remarks: string, forwardToDSW: boolean = false) => {
        setActionLoading(eventId);
        try {
            const res = await fetch(`${API_URL}/api/events/${eventId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, remarks, forwardToDSW })
            });

            if (res.ok) {
                setEvents(events.filter(e => e.id !== eventId));
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update event status');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating status');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="h-[50vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] animate-bounce mb-2"></div>
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">Loading Approval Pipeline...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="cartoon-sticker bg-amber-300 text-slate-950">
                        ⚡ Administrative Queue
                    </span>
                    <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600">
                        ← Dashboard
                    </Link>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Event Approvals
                </h1>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Review incoming student & faculty event proposals requiring your institutional sign-off
                </p>
            </div>

            {/* List */}
            {events.length === 0 ? (
                <div className="cartoon-card p-12 text-center bg-white dark:bg-slate-900">
                    <span className="text-5xl block mb-3">🎉</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Approval Pipeline Clear!</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">There are no pending event proposals waiting for your review.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {events.map((event) => {
                        const statusBadge =
                            event.status === 'PENDING_HOD_APPROVAL'
                                ? 'bg-orange-300 text-slate-950'
                                : event.status === 'PENDING_DSW_APPROVAL'
                                ? 'bg-purple-300 text-slate-950'
                                : 'bg-amber-300 text-slate-950';

                        return (
                            <div
                                key={event.id}
                                className="cartoon-card bg-white dark:bg-slate-900 overflow-hidden"
                            >
                                {/* Event Header */}
                                <div className="p-5 border-b-2 border-slate-900 dark:border-slate-800 bg-amber-50/60 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-amber-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center font-black text-sm">
                                            📋
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                                {event.title}
                                            </h3>
                                            <span className="text-xs font-bold text-slate-500">
                                                Proposal #{event.id}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`cartoon-badge ${statusBadge}`}>
                                        <Clock className="h-3 w-3" />
                                        {event.status.replace(/_/g, ' ')}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="p-5 sm:p-6 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="cartoon-card p-3 bg-slate-50 dark:bg-slate-950/50 border">
                                            <p className="text-[10px] font-black uppercase text-slate-500">Organizing Body</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                                                {event.club?.name || 'Independent Dept Event'}
                                            </p>
                                        </div>

                                        <div className="cartoon-card p-3 bg-slate-50 dark:bg-slate-950/50 border">
                                            <p className="text-[10px] font-black uppercase text-slate-500">Scheduled Date</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white mt-1">
                                                {new Date(event.startDateTime).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        <div className="cartoon-card p-3 bg-slate-50 dark:bg-slate-950/50 border">
                                            <p className="text-[10px] font-black uppercase text-slate-500">Venue Allocated</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white mt-1 truncate">
                                                {event.schedules && event.schedules[0]?.venue
                                                    ? event.schedules[0].venue.name
                                                    : 'No Venue'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="cartoon-card p-4 bg-slate-50 dark:bg-slate-950/40 border">
                                        <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Proposal Overview</p>
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {event.description || event.purpose || "No overview text provided."}
                                        </p>
                                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                                            <span className="font-bold text-slate-500">Target Audience: {event.targetAudience || 'General Students'}</span>
                                            <Link
                                                href={`/dashboard/events/${event.id}?from=approvals`}
                                                className="font-black text-indigo-600 dark:text-amber-400 hover:underline inline-flex items-center"
                                            >
                                                Inspect Full Proposal <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="p-4 px-6 border-t-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => initiateAction(event.id, 'REJECTED')}
                                        disabled={actionLoading === event.id}
                                        className="cartoon-btn bg-rose-200 hover:bg-rose-300 text-rose-950 px-4 py-2 text-xs font-black shadow-[2px_2px_0px_#0f172a]"
                                    >
                                        <XCircle className="h-3.5 w-3.5 mr-1.5" /> Reject Proposal
                                    </button>
                                    <button
                                        onClick={() => initiateAction(event.id, 'APPROVED')}
                                        disabled={actionLoading === event.id}
                                        className="cartoon-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-5 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve ✨
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Action Remark Modal */}
            {showActionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-pop">
                    <div className="cartoon-card bg-white dark:bg-slate-900 max-w-md w-full p-6 sm:p-8 relative">
                        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 dark:border-slate-800 mb-4">
                            <div className="flex items-center gap-2">
                                <span className={`cartoon-sticker ${actionType === 'APPROVED' ? 'bg-emerald-300' : 'bg-rose-300'} text-slate-950`}>
                                    {actionType === 'APPROVED' ? 'Approval' : 'Rejection'}
                                </span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    {actionType === 'APPROVED' ? 'Authorize Event' : 'Decline Proposal'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="cartoon-btn p-1.5 bg-slate-100 hover:bg-rose-200 text-slate-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                            {actionType === 'APPROVED'
                                ? 'Add any required conditions, notes, or remarks for this event schedule:'
                                : 'Please provide specific feedback/reason for rejection (visible to coordinator):'}
                        </p>

                        <textarea
                            value={actionRemark}
                            onChange={(e) => setActionRemark(e.target.value)}
                            rows={3}
                            placeholder={actionType === 'APPROVED' ? "Approved as submitted. Sound limit 10 PM." : "Reason for rejection..."}
                            className="w-full rounded-xl py-2 px-3 text-xs font-medium bg-slate-50 dark:bg-slate-950 mb-4"
                            autoFocus
                        />

                        {user?.role === 'HOD' && actionType === 'APPROVED' && (
                            <div className="cartoon-card p-3 bg-amber-50 dark:bg-slate-950/60 border mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="forwardDsw"
                                    checked={forwardToDSW}
                                    onChange={(e) => setForwardToDSW(e.target.checked)}
                                    className="w-4 h-4 rounded border-2 border-slate-900 text-indigo-600 focus:ring-0"
                                />
                                <label htmlFor="forwardDsw" className="ml-2 text-xs font-black text-slate-800 dark:text-slate-200">
                                    Forward to DSW for Final Sanction
                                </label>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowActionModal(false)}
                                className="cartoon-btn bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-black"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmAction}
                                className={`cartoon-btn px-5 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a] ${
                                    actionType === 'APPROVED'
                                        ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                                        : 'bg-rose-400 hover:bg-rose-300 text-slate-950'
                                }`}
                            >
                                Confirm {actionType === 'APPROVED' ? 'Approval' : 'Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
