'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/config/api';
import { Calendar, Search, ArrowLeft, Clock, MapPin, X } from 'lucide-react';

interface Booking {
    id: number;
    eventName: string;
    clubName: string;
    venueName: string;
    startDateTime: string;
    endDateTime: string;
    status: string;
}

function ScheduleContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const venueParam = searchParams.get('venue') || '';

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(venueParam);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/venues/bookings`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b =>
        b.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.clubName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                            📅 Live Reservations
                        </span>
                        <Link href="/dashboard/venues" className="text-xs font-bold text-slate-500 hover:text-indigo-600 inline-flex items-center">
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Venues
                        </Link>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Venues Schedule & Bookings
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                        Real-time confirmed reservations across campus auditoriums, seminar halls, and grounds
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/venues"
                        className="cartoon-btn bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-900 dark:text-white px-3.5 py-2 text-xs font-black inline-flex items-center"
                    >
                        <MapPin className="h-4 w-4 mr-1.5" /> Manage Venues
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="cartoon-card bg-white dark:bg-slate-900 p-4">
                <div className="relative max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filter by venue, event title, or club..."
                        className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            title="Clear search"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Filtering for:</span>
                        <span className="cartoon-sticker bg-amber-200 text-slate-950 text-[11px] flex items-center gap-1">
                            {searchTerm}
                            <button onClick={() => setSearchTerm('')} className="hover:text-rose-600">×</button>
                        </span>
                    </div>
                )}
            </div>

            {/* Schedule Table */}
            <div className="cartoon-card bg-white dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900 dark:border-slate-800 bg-amber-50 dark:bg-slate-950/60">
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Venue</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Event</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Organizing Club</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">From</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">To</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800/80">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">
                                        <div className="w-10 h-10 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] animate-bounce mx-auto mb-2"></div>
                                        Loading schedule...
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                                        No scheduled bookings found {searchTerm ? `matching "${searchTerm}"` : ''}.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                                                <span>{booking.venueName}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-900 dark:text-white">
                                            {booking.eventName}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                            {booking.clubName}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                                <span>{formatDate(booking.startDateTime)}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                <span>{formatDate(booking.endDateTime)}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right whitespace-nowrap">
                                            <span className={`cartoon-badge text-xs ${
                                                booking.status === 'APPROVED' ? 'bg-emerald-300 text-slate-950' :
                                                booking.status === 'COMPLETED' ? 'bg-sky-300 text-slate-950' :
                                                booking.status === 'REJECTED' ? 'bg-rose-300 text-slate-950' :
                                                'bg-amber-300 text-slate-950'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function VenueSchedulePage() {
    return (
        <Suspense fallback={
            <div className="h-[50vh] flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] animate-bounce mb-2"></div>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300">Loading Schedule...</p>
            </div>
        }>
            <ScheduleContent />
        </Suspense>
    );
}
