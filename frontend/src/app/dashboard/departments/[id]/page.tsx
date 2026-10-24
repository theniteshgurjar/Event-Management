'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
    Building, 
    ArrowLeft, 
    MapPin, 
    Users, 
    Calendar, 
    Mail, 
    User, 
    ExternalLink, 
    Clock, 
    CheckCircle2, 
    FileText, 
    Loader2, 
    AlertCircle,
    Sparkles,
    Shield,
    Tag
} from 'lucide-react';
import { API_URL } from '@/config/api';

interface DepartmentDetail {
    id: number;
    name: string;
    code: string;
    hodId: number | null;
    hod?: { id: number; name: string; email: string };
    venues?: Array<{ id: number; name: string; capacity: number; isDepartmentRestricted: boolean }>;
    clubs?: Array<{ id: number; name: string; description: string | null }>;
    events?: Array<{
        id: number;
        title: string;
        description: string;
        startDateTime: string;
        endDateTime: string;
        status: string;
        report?: { id: number } | null;
    }>;
}

export default function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const { token, loading: authLoading } = useAuth();
    const [deptId, setDeptId] = useState<string>('');
    const [department, setDepartment] = useState<DepartmentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed'>('all');

    useEffect(() => {
        Promise.resolve(params).then((p) => {
            setDeptId(p.id);
            if (token) {
                fetchDepartmentDetails(p.id, token);
            }
        });
    }, [params, token]);

    const fetchDepartmentDetails = async (id: string, authToken: string) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/departments/${id}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setDepartment(data);
            }
        } catch (error) {
            console.error("Failed to fetch department", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <p className="text-sm font-bold text-slate-500">Loading department profile...</p>
            </div>
        );
    }

    if (!department) {
        return (
            <div className="cartoon-card p-12 text-center bg-white dark:bg-slate-900 max-w-lg mx-auto mt-12 border-2 border-slate-900">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 border-2 border-slate-900 flex items-center justify-center mx-auto mb-3 text-rose-600">
                    <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Department Not Found</h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-4">
                    The requested department profile could not be located or you may lack permissions.
                </p>
                <Link href="/dashboard/departments" className="cartoon-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs font-black shadow-[2px_2px_0px_#0f172a]">
                    ← Back to All Departments
                </Link>
            </div>
        );
    }

    const venuesList = department.venues || [];
    const clubsList = department.clubs || [];
    const eventsList = department.events || [];

    const now = new Date();
    const filteredEvents = eventsList.filter(e => {
        const eventDate = new Date(e.startDateTime);
        if (activeTab === 'upcoming') return eventDate >= now;
        if (activeTab === 'completed') return eventDate < now || e.status === 'COMPLETED';
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in pb-16">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex items-center justify-between">
                <Link 
                    href="/dashboard/departments"
                    className="cartoon-btn bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3.5 py-1.5 text-xs font-black shadow-[2px_2px_0px_#0f172a] hover:bg-amber-300 hover:text-slate-950 flex items-center gap-1.5"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>All Departments</span>
                </Link>

                <span className="cartoon-badge bg-cyan-200 text-slate-950 text-xs font-bold font-mono">
                    ID #{department.id}
                </span>
            </div>

            {/* Department Hero Card */}
            <div className="cartoon-card bg-white dark:bg-slate-900 border-2 border-slate-900 p-6 sm:p-8 relative overflow-hidden shadow-[4px_4px_0px_#0f172a]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-950 shrink-0 font-mono">
                        {department.code}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="cartoon-badge bg-indigo-100 text-indigo-950 dark:bg-indigo-950 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800 text-[11px] font-black font-mono">
                                CODE: {department.code}
                            </span>
                            <span className="cartoon-badge bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 text-[11px]">
                                Academic Faculty Unit
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                            {department.name}
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                            Official administrative unit coordinating curricula, student clubs, and campus venues.
                        </p>
                    </div>

                    {/* Quick Metric Pills */}
                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                        <div className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                            <span className="text-xl font-black text-slate-900 dark:text-white block leading-none">{venuesList.length}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Venues</span>
                        </div>
                        <div className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                            <span className="text-xl font-black text-slate-900 dark:text-white block leading-none">{clubsList.length}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Clubs</span>
                        </div>
                        <div className="flex-1 sm:flex-initial text-center px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                            <span className="text-xl font-black text-slate-900 dark:text-white block leading-none">{eventsList.length}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Events</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Leadership & Facilities */}
                <div className="space-y-6">

                    {/* Department Head (HOD) Card */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 shadow-[3px_3px_0px_#0f172a]">
                        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                                <Shield className="h-4 w-4 text-indigo-500" />
                                Department Leadership
                            </h3>
                            <span className="cartoon-badge bg-purple-100 text-purple-950 text-[10px]">
                                Head of Dept
                            </span>
                        </div>

                        {department.hod ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-200 dark:bg-indigo-900 border-2 border-slate-900 text-slate-950 dark:text-indigo-200 flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#0f172a] shrink-0">
                                        {department.hod.name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                            {department.hod.name}
                                        </h4>
                                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            Designated HOD
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        <a 
                                            href={`mailto:${department.hod.email}`} 
                                            className="hover:text-indigo-600 dark:hover:text-indigo-400 font-bold truncate hover:underline"
                                        >
                                            {department.hod.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 px-4 bg-rose-50 dark:bg-rose-950/30 rounded-xl border-2 border-dashed border-rose-300 dark:border-rose-900">
                                <AlertCircle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
                                <p className="text-xs font-black text-rose-900 dark:text-rose-300">No HOD Appointed</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    This department requires a designated Head of Department for event approval routing.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Venues Managed by Department */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 shadow-[3px_3px_0px_#0f172a]">
                        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-sky-500" />
                                Assigned Venues ({venuesList.length})
                            </h3>
                            <Link href="/dashboard/venues" className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline">
                                All Venues &rarr;
                            </Link>
                        </div>

                        {venuesList.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-4 text-center">
                                No department-specific venues assigned.
                            </p>
                        ) : (
                            <div className="space-y-2.5">
                                {venuesList.map((venue) => (
                                    <div 
                                        key={venue.id} 
                                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white">
                                                {venue.name}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-500">
                                                Capacity: {venue.capacity} attendees
                                            </p>
                                        </div>

                                        {venue.isDepartmentRestricted && (
                                            <span className="cartoon-badge bg-amber-100 text-amber-900 text-[9px] py-0.5">
                                                Restricted
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Affiliated Clubs */}
                    <div className="cartoon-card bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 shadow-[3px_3px_0px_#0f172a]">
                        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 dark:border-slate-800 mb-4">
                            <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-amber-500" />
                                Affiliated Clubs ({clubsList.length})
                            </h3>
                            <Link href="/dashboard/clubs" className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:underline">
                                Explore Clubs &rarr;
                            </Link>
                        </div>

                        {clubsList.length === 0 ? (
                            <p className="text-xs text-slate-400 italic py-4 text-center">
                                No clubs linked directly to this department.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {clubsList.map((club) => (
                                    <Link 
                                        key={club.id} 
                                        href={`/dashboard/clubs/${club.id}`}
                                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-100/60 dark:bg-slate-950/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors group"
                                    >
                                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-slate-950">
                                            {club.name}
                                        </span>
                                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-950 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Events & Programs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="cartoon-card bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 sm:p-6 shadow-[3px_3px_0px_#0f172a]">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-100 dark:border-slate-800 mb-5">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-emerald-500" />
                                    Department Events & Programs
                                </h3>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Official proposals approved or completed under this department
                                </p>
                            </div>

                            {/* Event Filter Tabs */}
                            <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                                        activeTab === 'all'
                                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    All ({eventsList.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                                        activeTab === 'upcoming'
                                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    Upcoming
                                </button>
                                <button
                                    onClick={() => setActiveTab('completed')}
                                    className={`px-3 py-1 rounded-lg text-xs font-black transition-colors ${
                                        activeTab === 'completed'
                                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                    }`}
                                >
                                    Past
                                </button>
                            </div>
                        </div>

                        {/* Events List */}
                        {filteredEvents.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 flex items-center justify-center mx-auto mb-3 text-slate-400">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">No Events Found</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    No events match the selected filter for {department.name}.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredEvents.map((event) => {
                                    const eventDate = new Date(event.startDateTime);
                                    const formattedDate = eventDate.toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    });
                                    const formattedTime = eventDate.toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    });

                                    const isApproved = event.status === 'APPROVED';
                                    const isCompleted = event.status === 'COMPLETED';

                                    const statusBadgeColor = isApproved
                                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                        : isCompleted
                                        ? 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                                        : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';

                                    return (
                                        <div 
                                            key={event.id}
                                            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-900 dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${statusBadgeColor}`}>
                                                        {event.status}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formattedDate} • {formattedTime}
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                                    {event.title}
                                                </h4>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
                                                    {event.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {event.report && (
                                                    <Link 
                                                        href={`/dashboard/reports/${event.report.id}?backUrl=/dashboard/departments/${department.id}`}
                                                        className="cartoon-btn bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_#0f172a] flex items-center gap-1"
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                        <span>Report</span>
                                                    </Link>
                                                )}

                                                <Link 
                                                    href={`/dashboard/events/${event.id}?backUrl=/dashboard/departments/${department.id}`}
                                                    className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-amber-300 hover:text-slate-950 px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_#0f172a] flex items-center gap-1"
                                                >
                                                    <span>Details</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
