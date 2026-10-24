'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Users, Calendar as CalendarIcon, ArrowUpRight, Plus, MapPin, Trash2, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { API_URL } from '@/config/api';

export default function EventsPage() {
    const { user, token } = useAuth();
    const [events, setEvents] = useState<any[]>([]);
    const [filter, setFilter] = useState<'Upcoming' | 'Past' | 'All'>('Upcoming');

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this event proposal?')) return;

        try {
            const res = await fetch(`${API_URL}/api/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setEvents(events.filter((e: any) => e.id !== id));
                alert('Event deleted successfully.');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete event.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        }
    };

    useEffect(() => {
        if (!token) return;

        const headers: any = { 'Authorization': `Bearer ${token}` };
        
        let url = `${API_URL}/api/events`;
        if (filter === 'Upcoming') {
            url += '?upcoming=true';
        } else if (filter === 'Past') {
            url += '?past=true';
        }

        fetch(url, { headers })
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error(err));
    }, [token, filter]);

    // Student and DSW are strictly disallowed from creating event proposals
    const canCreate = ['ADMIN', 'CLUB_COORDINATOR', 'FACULTY'].includes(user?.role || '');
    const isStudent = user?.role === 'STUDENT';

    // Students strictly only see officially approved/completed events
    const displayEvents = (events || []).filter((e: any) => {
        if (isStudent) {
            return e.status === 'APPROVED' || e.status === 'COMPLETED';
        }
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="cartoon-sticker bg-amber-300 text-slate-950">
                            🎪 Activities
                        </span>
                        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600">
                            ← Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {isStudent ? 'Campus Events' : 'Events & Proposals'}
                    </h1>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {isStudent
                            ? 'Explore all officially approved university gatherings, competitions, and department events'
                            : 'Explore all university gatherings, competitions, and department proposals'}
                    </p>
                </div>
                
                {canCreate && (
                    <Link
                        href="/dashboard/events/create"
                        className="cartoon-btn bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-sm font-black shadow-[3px_3px_0px_#0f172a] dark:shadow-[3px_3px_0px_#818cf8]"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Submit New Proposal
                    </Link>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1.5 cartoon-card bg-slate-100 dark:bg-slate-900 w-fit">
                {(['Upcoming', 'Past', 'All'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`cartoon-btn px-4 py-1.5 text-xs font-black transition-all ${
                            filter === tab
                                ? 'bg-amber-300 text-slate-950 shadow-[2px_2px_0px_#0f172a]'
                                : 'bg-transparent border-transparent shadow-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        {tab === 'Upcoming' && '🔥 '}
                        {tab === 'Past' && '📦 '}
                        {tab === 'All' && '✨ '}
                        {tab} Events
                    </button>
                ))}
            </div>

            {/* Events Grid */}
            {displayEvents.length === 0 ? (
                <div className="cartoon-card p-12 text-center bg-white dark:bg-slate-900">
                    <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        No events found in this category
                    </h3>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        {isStudent 
                            ? 'Check back soon for new officially sanctioned events!'
                            : 'Try switching filters or propose a new event above!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayEvents.map((event) => {
                        const eventDate = new Date(event.startDateTime).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        });

                        const eventTime = new Date(event.startDateTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        const statusColor =
                            event.status === 'APPROVED'
                                ? 'bg-emerald-300 text-slate-950'
                                : event.status === 'REJECTED'
                                ? 'bg-rose-300 text-slate-950'
                                : 'bg-amber-300 text-slate-950';

                        return (
                            <div
                                key={event.id}
                                className="cartoon-card cartoon-card-hover bg-white dark:bg-slate-900 p-6 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                                            {event.title}
                                        </h3>
                                        {isStudent ? (
                                            <span className="cartoon-badge bg-emerald-300 text-slate-950 text-[10px] py-0.5">
                                                ✓ Approved
                                            </span>
                                        ) : (
                                            <span className={`cartoon-badge ${statusColor} text-[10px] py-0.5`}>
                                                {event.status}
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 mt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-slate-800 border-2 border-slate-900 flex items-center justify-center flex-shrink-0 text-slate-900 dark:text-white">
                                                <Users className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="truncate">
                                                {event.club?.name || 'Independent Event'}
                                                {event.collaborators && event.collaborators.length > 0 && (
                                                    <span className="text-slate-400 font-semibold ml-1">
                                                        (+ {event.collaborators.length})
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-slate-800 border-2 border-slate-900 flex items-center justify-center flex-shrink-0 text-slate-900 dark:text-white">
                                                <CalendarIcon className="h-3.5 w-3.5" />
                                            </div>
                                            <span>
                                                {eventDate} at {eventTime}
                                            </span>
                                        </div>

                                        {event.venue && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-slate-800 border-2 border-slate-900 flex items-center justify-center flex-shrink-0 text-slate-900 dark:text-white">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="truncate">{event.venue.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                                    <Link
                                        href={`/dashboard/events/${event.id}`}
                                        className="cartoon-btn w-full bg-slate-100 dark:bg-slate-800 hover:bg-amber-300 dark:hover:bg-amber-400 text-slate-900 dark:text-white hover:text-slate-950 py-2 text-xs font-black text-center flex items-center justify-center gap-1 transition-colors"
                                    >
                                        View Event Details
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>

                                    {/* Faculty Advisor / Coordinator / Admin Delete Action */}
                                    {!isStudent && user?.role !== 'DSW' && event.status !== 'APPROVED' && (
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            className="cartoon-btn p-2 bg-rose-100 hover:bg-rose-200 text-rose-700 flex-shrink-0"
                                            title="Delete Proposal"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
