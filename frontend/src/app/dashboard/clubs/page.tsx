'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Search, Plus, Trash2, ArrowUpRight, X, Sparkles } from 'lucide-react';
import { API_URL } from '@/config/api';

interface Club {
    id: number;
    name: string;
    description: string;
    logoUrl?: string;
    status: string;
}

export default function ClubsPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = () => {
        fetch(`${API_URL}/api/clubs`)
            .then(res => res.json())
            .then(data => setClubs(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const filteredClubs = clubs.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateClub = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch(`${API_URL}/api/clubs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName, description: newDesc })
            });

            if (res.ok) {
                setShowModal(false);
                setNewName('');
                setNewDesc('');
                fetchClubs();
                alert('Club registered successfully!');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create club');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating club');
        } finally {
            setIsCreating(false);
        }
    };

    if (loading) return (
        <div className="h-[50vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] animate-bounce mb-2"></div>
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">Loading Student Organizations...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header and Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="cartoon-sticker bg-sky-300 text-slate-950">
                            👥 Student Societies
                        </span>
                        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600">
                            ← Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Clubs & Chapters
                    </h1>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Explore all university student organizations, leadership teams, and initiatives
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search clubs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl py-2 pl-9 pr-3 text-xs font-bold bg-white dark:bg-slate-900"
                        />
                    </div>
                    {['ADMIN', 'DSW'].includes(user?.role || '') && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="cartoon-btn w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                        >
                            <Plus className="h-4 w-4 mr-1" /> Create Club
                        </button>
                    )}
                </div>
            </div>

            {/* Clubs Grid/Table */}
            {filteredClubs.length === 0 ? (
                <div className="cartoon-card p-12 text-center bg-white dark:bg-slate-900">
                    <span className="text-4xl block mb-2">🔍</span>
                    <p className="font-black text-slate-700 dark:text-slate-300">
                        No clubs matching "{searchTerm}"
                    </p>
                </div>
            ) : (
                <div className="cartoon-card bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-900 dark:border-slate-800 bg-amber-50 dark:bg-slate-950/60">
                                    <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Club / Society</th>
                                    <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider hidden sm:table-cell">Mission & Overview</th>
                                    <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800/80">
                                {filteredClubs.map((club, idx) => {
                                    const colors = ['bg-rose-200', 'bg-sky-200', 'bg-amber-200', 'bg-emerald-200', 'bg-indigo-200', 'bg-purple-200'];
                                    const badgeColor = colors[idx % colors.length];

                                    return (
                                        <tr key={club.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-11 h-11 rounded-2xl ${badgeColor} border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center overflow-hidden flex-shrink-0 font-black text-slate-900`}>
                                                        {club.logoUrl ? (
                                                            <img
                                                                src={club.logoUrl}
                                                                alt={club.name}
                                                                className="h-full w-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>{club.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={`/dashboard/clubs/${club.id}`}
                                                            className="font-black text-slate-900 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-amber-400 transition-colors block"
                                                        >
                                                            {club.name}
                                                        </Link>
                                                        <span className="cartoon-badge text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-0 px-2 mt-0.5">
                                                            {club.status || "ACTIVE"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 hidden sm:table-cell max-w-md">
                                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2">
                                                    {club.description || 'No description provided yet.'}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/dashboard/clubs/${club.id}`}
                                                        className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1 text-xs font-black hover:bg-amber-300 hover:text-slate-950 shadow-[2px_2px_0px_#0f172a]"
                                                    >
                                                        Manage <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                                                    </Link>

                                                    {['ADMIN', 'DSW'].includes(user?.role || '') && (
                                                        <button
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                if (!confirm(`Are you sure you want to delete "${club.name}"?`)) return;

                                                                try {
                                                                    const res = await fetch(`${API_URL}/api/clubs/${club.id}`, {
                                                                        method: 'DELETE',
                                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                                    });
                                                                    if (res.ok) {
                                                                        setClubs(clubs.filter(c => c.id !== club.id));
                                                                        alert('Club deleted successfully.');
                                                                    } else {
                                                                        const data = await res.json();
                                                                        alert(data.error || 'Failed to delete club');
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert('Error deleting club');
                                                                }
                                                            }}
                                                            className="cartoon-btn bg-rose-100 hover:bg-rose-200 text-rose-700 p-1.5 shadow-[2px_2px_0px_#0f172a]"
                                                            title="Delete club"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Club Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-pop">
                    <div className="cartoon-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 sm:p-8 relative">
                        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 dark:border-slate-800 mb-5">
                            <div className="flex items-center gap-2">
                                <span className="cartoon-sticker bg-amber-300 text-slate-950">
                                    New Entity
                                </span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Register Club</h3>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="cartoon-btn p-1.5 bg-slate-100 hover:bg-rose-200 text-slate-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClub} className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1.5">
                                    Club Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Robotics & AI Society"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1.5">
                                    Mission / Description
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Brief overview of activities, target student base, and aims..."
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-medium bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="cartoon-btn bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-black"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="cartoon-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-5 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                                >
                                    {isCreating ? "Registering..." : "Confirm & Create ✨"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
