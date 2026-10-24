'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Users, Award, Calendar, Sparkles } from 'lucide-react';
import { API_URL } from '@/config/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'];

export default function AnalyticsPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [overall, setOverall] = useState<any>(null);
    const [clubStats, setClubStats] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [clubs, setClubs] = useState<any[]>([]);
    const [selectedClub, setSelectedClub] = useState('');

    useEffect(() => {
        const fetchClubs = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_URL}/api/clubs`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) setClubs(await res.json());
            } catch (e) {
                console.error("Failed to load clubs", e);
            }
        };

        fetchClubs();
    }, [token]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!token) return;
            try {
                const headers = { 'Authorization': `Bearer ${token}` };
                const query = `?startDate=${startDate}&endDate=${endDate}&clubId=${selectedClub}`;

                const [resOverall, resClubs, resTrends, resVenues, resCats] = await Promise.all([
                    fetch(`${API_URL}/api/analytics/overall${query}`, { headers }),
                    fetch(`${API_URL}/api/analytics/clubs${query}`, { headers }),
                    fetch(`${API_URL}/api/analytics/trends${query}`, { headers }),
                    fetch(`${API_URL}/api/analytics/venues${query}`, { headers }),
                    fetch(`${API_URL}/api/analytics/categories${query}`, { headers })
                ]);

                if (resOverall.ok) setOverall(await resOverall.json());
                if (resClubs.ok) setClubStats(await resClubs.json());
                if (resTrends.ok) setTrends(await resTrends.json());
                if (resVenues.ok) setVenues(await resVenues.json());
                if (resCats.ok) setCategories(await resCats.json());

            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [token, startDate, endDate, selectedClub]);

    if (loading) return (
        <div className="h-[50vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] animate-bounce mb-2"></div>
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">Crunching Campus Metrics...</p>
        </div>
    );
    if (!overall) return <div className="cartoon-card p-10 text-center text-rose-500 font-black">Failed to load analytics data.</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="cartoon-sticker bg-purple-300 text-slate-950">
                            📊 Big Data
                        </span>
                        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600">
                            ← Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Analytics & Insights
                    </h1>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Institutional attendance, student engagement, and event budget analytics
                    </p>
                </div>

                {/* Filters */}
                <div className="cartoon-card p-3 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-3">
                    <div>
                        <label className="text-[10px] uppercase font-black text-slate-500 block">Filter Club</label>
                        <select
                            value={selectedClub}
                            onChange={(e) => setSelectedClub(e.target.value)}
                            className="text-xs font-bold bg-transparent outline-none py-1 text-slate-900 dark:text-white"
                        >
                            <option value="">All Clubs & Orgs</option>
                            {clubs.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="hidden sm:block w-px h-6 bg-slate-300 dark:bg-slate-700"></div>

                    <div>
                        <label className="text-[10px] uppercase font-black text-slate-500 block">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-xs font-bold bg-transparent outline-none py-1 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-black text-slate-500 block">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-xs font-bold bg-transparent outline-none py-1 text-slate-900 dark:text-white"
                        />
                    </div>

                    {(startDate || endDate || selectedClub) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); setSelectedClub(''); }}
                            className="cartoon-btn bg-rose-200 text-rose-950 px-2.5 py-1 text-[11px] font-black self-end"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Stat Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="cartoon-card p-5 bg-amber-50 dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black uppercase text-slate-500">Approved Events</span>
                        <span className="cartoon-sticker text-[9px] bg-amber-300 text-slate-950">Active</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{overall.events.approved}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">Total Proposals: {overall.events.total}</p>
                </div>

                <div className="cartoon-card p-5 bg-emerald-50 dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black uppercase text-slate-500">Budget Utilized</span>
                        <span className="cartoon-sticker text-[9px] bg-emerald-300 text-slate-950">Verified</span>
                    </div>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{overall.financials.totalUtilized?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-1">Expenditure logged</p>
                </div>

                <div className="cartoon-card p-5 bg-sky-50 dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black uppercase text-slate-500">Student Attendance</span>
                        <span className="cartoon-sticker text-[9px] bg-sky-300 text-slate-950">Reach</span>
                    </div>
                    <p className="text-3xl font-black text-sky-600 dark:text-sky-400">
                        {overall.participation.participants?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                        Attendees: {overall.participation.attendees?.toLocaleString() || '0'}
                    </p>
                </div>

                <div className="cartoon-card p-5 bg-rose-50 dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black uppercase text-slate-500">Registered Clubs</span>
                        <span className="cartoon-sticker text-[9px] bg-rose-300 text-slate-950">Societies</span>
                    </div>
                    <p className="text-3xl font-black text-rose-600 dark:text-rose-400">
                        {overall.clubs.active}
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-1">Active leadership</p>
                </div>
            </div>

            {/* Row 1: Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="cartoon-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-8 h-8 rounded-xl bg-indigo-200 border-2 border-slate-900 flex items-center justify-center font-black text-sm">
                            📈
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Participation Timeline</h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748B" />
                                <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748B" />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0f172a', fontWeight: 'bold' }} />
                                <Legend />
                                <Line type="monotone" dataKey="attendees" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} name="Attendees" />
                                <Line type="monotone" dataKey="events" stroke="#10b981" strokeWidth={3} name="Events Count" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="cartoon-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-8 h-8 rounded-xl bg-emerald-200 border-2 border-slate-900 flex items-center justify-center font-black text-sm">
                            💰
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Top Club Expenditures</h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={clubStats.slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                <XAxis type="number" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748B" />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748B" />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0f172a', fontWeight: 'bold' }} />
                                <Bar dataKey="totalExpenditure" fill="#10b981" stroke="#0f172a" strokeWidth={2} radius={[0, 8, 8, 0]} name="Expenditure (₹)" barSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 2: Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="cartoon-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-8 h-8 rounded-xl bg-purple-200 border-2 border-slate-900 flex items-center justify-center font-black text-sm">
                            🍕
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Events by Category</h3>
                    </div>
                    <div className="h-72 flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categories}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={85}
                                    dataKey="value"
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0f172a" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0f172a', fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="cartoon-card p-6 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-8 h-8 rounded-xl bg-amber-200 border-2 border-slate-900 flex items-center justify-center font-black text-sm">
                            🏛️
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Popular Venues (Bookings)</h3>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={venues.slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748B" />
                                <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#64748B" />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #0f172a', fontWeight: 'bold' }} />
                                <Bar dataKey="eventsCount" fill="#f59e0b" stroke="#0f172a" strokeWidth={2} radius={[8, 8, 0, 0]} name="Bookings" barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
