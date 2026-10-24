'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Users, Plus, Edit2, Trash2, X, Building, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { API_URL } from '@/config/api';

interface Venue {
    id: number;
    name: string;
    capacity: number;
    facilities: string | null;
    departmentId?: number | null;
    department?: { id: number; name: string };
    isDepartmentRestricted: boolean;
}

interface Department {
    id: number;
    name: string;
}

export default function VenuesPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        capacity: '',
        facilities: '',
        departmentId: '' as string | number,
        isDepartmentRestricted: false
    });

    useEffect(() => {
        if (!user) return;
        fetchVenues();
        fetchDepartments();
    }, [user, router]);

    const fetchVenues = async () => {
        try {
            const res = await fetch(`${API_URL}/api/venues`);
            if (res.ok) {
                const data = await res.json();
                setVenues(data);
            }
        } catch (err) {
            console.error("Failed to fetch venues", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch(`${API_URL}/api/departments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (err) {
            console.error("Failed to fetch departments", err);
        }
    };

    const handleOpenModal = (venue?: Venue) => {
        if (venue) {
            setCurrentVenue(venue);
            setFormData({
                name: venue.name,
                capacity: venue.capacity.toString(),
                facilities: venue.facilities || '',
                departmentId: venue.departmentId || '',
                isDepartmentRestricted: venue.isDepartmentRestricted
            });
        } else {
            setCurrentVenue(null);
            setFormData({ name: '', capacity: '', facilities: '', departmentId: '', isDepartmentRestricted: false });
        }
        setIsModalOpen(true);
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentVenue(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.isDepartmentRestricted && !formData.departmentId) {
            setError('Please select a department if setting department restriction.');
            return;
        }

        const payload = {
            name: formData.name,
            capacity: parseInt(formData.capacity),
            facilities: formData.facilities,
            departmentId: formData.departmentId ? parseInt(formData.departmentId as string) : null,
            isDepartmentRestricted: formData.isDepartmentRestricted
        };

        try {
            const url = currentVenue
                ? `${API_URL}/api/venues/${currentVenue.id}`
                : `${API_URL}/api/venues`;
            const method = currentVenue ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchVenues();
                handleCloseModal();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to save venue');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this venue?')) return;
        try {
            const res = await fetch(`${API_URL}/api/venues/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchVenues();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete venue');
            }
        } catch (err) {
            alert('Failed to delete venue.');
        }
    };

    if (loading) return (
        <div className="h-[50vh] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] animate-bounce mb-2"></div>
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">Loading Campus Venues & Auditoriums...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="cartoon-sticker bg-rose-300 text-slate-950">
                            🏛️ Campus Spaces
                        </span>
                        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600">
                            ← Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Venues & Auditoriums
                    </h1>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Halls, seminar complexes, and grounds available for campus activities
                    </p>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <Link
                        href="/dashboard/venues/schedule"
                        className="cartoon-btn bg-amber-300 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a] inline-flex items-center"
                    >
                        <Calendar className="h-4 w-4 mr-1.5" /> See Schedule
                    </Link>

                    {['ADMIN', 'DSW'].includes(user?.role || '') && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="cartoon-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-3.5 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a] inline-flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-1.5" /> Add New Venue
                        </button>
                    )}
                </div>
            </div>

            {/* Venues Grid Table */}
            <div className="cartoon-card bg-white dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900 dark:border-slate-800 bg-amber-50 dark:bg-slate-950/60">
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Venue Name</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Capacity</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Ownership / Restriction</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider hidden sm:table-cell">Facilities</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800/80">
                            {venues.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                                        No venues registered yet.
                                    </td>
                                </tr>
                            ) : (
                                venues.map((venue, idx) => {
                                    const iconColors = ['bg-amber-300', 'bg-sky-300', 'bg-rose-300', 'bg-emerald-300', 'bg-purple-300'];
                                    const iconBg = iconColors[idx % iconColors.length];

                                    return (
                                        <tr key={venue.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-2xl ${iconBg} border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center flex-shrink-0 text-slate-950`}>
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-900 dark:text-white text-sm block">
                                                            {venue.name}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-500">
                                                            Venue ID #{venue.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="cartoon-badge bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-400 text-xs">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    {venue.capacity} seats
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                {venue.department ? (
                                                    <span className={`cartoon-badge ${
                                                        venue.isDepartmentRestricted
                                                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-400'
                                                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400'
                                                    }`}>
                                                        {venue.department.name} {venue.isDepartmentRestricted ? '🔒 (Restricted)' : '🌐'}
                                                    </span>
                                                ) : (
                                                    <span className="cartoon-badge bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        General Campus
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-xs font-medium text-slate-600 dark:text-slate-400 max-w-xs truncate hidden sm:table-cell">
                                                {venue.facilities || 'Standard University Equipment'}
                                            </td>

                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/dashboard/venues/schedule?venue=${encodeURIComponent(venue.name)}`}
                                                        className="cartoon-btn bg-amber-200 hover:bg-amber-300 text-slate-950 px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_#0f172a] inline-flex items-center"
                                                        title={`See schedule for ${venue.name}`}
                                                    >
                                                        <Calendar className="h-3.5 w-3.5 mr-1" />
                                                        Schedule
                                                    </Link>

                                                    {['ADMIN', 'DSW'].includes(user?.role || '') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenModal(venue)}
                                                                className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-1.5 shadow-[2px_2px_0px_#0f172a] hover:bg-amber-300 hover:text-slate-950"
                                                                title="Edit Venue"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(venue.id)}
                                                                className="cartoon-btn bg-rose-100 hover:bg-rose-200 text-rose-700 p-1.5 shadow-[2px_2px_0px_#0f172a]"
                                                                title="Delete Venue"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-pop">
                    <div className="cartoon-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 sm:p-8 relative">
                        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 dark:border-slate-800 mb-5">
                            <div className="flex items-center gap-2">
                                <span className="cartoon-sticker bg-amber-300 text-slate-950">
                                    {currentVenue ? 'Update' : 'New'}
                                </span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    {currentVenue ? 'Edit Venue' : 'Create Campus Venue'}
                                </h3>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="cartoon-btn p-1.5 bg-slate-100 hover:bg-rose-200 text-slate-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {error && (
                            <div className="cartoon-badge bg-rose-100 text-rose-800 border-rose-400 mb-4 w-full">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                                    Venue Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Colloquium Hall"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                                    Seating Capacity
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="e.g. 500"
                                    value={formData.capacity}
                                    onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                                    Facilities & Equipment
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Dual Projector, Wireless Microphones, Podium, AC"
                                    value={formData.facilities}
                                    onChange={e => setFormData({ ...formData, facilities: e.target.value })}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-medium bg-slate-50 dark:bg-slate-950"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                                        Assigned Department
                                    </label>
                                    <select
                                        value={formData.departmentId}
                                        onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950"
                                    >
                                        <option value="">-- General / Common --</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center pt-5">
                                    <input
                                        type="checkbox"
                                        id="isRestricted"
                                        className="w-5 h-5 rounded-lg border-2 border-slate-900 text-indigo-600 focus:ring-0"
                                        checked={formData.isDepartmentRestricted}
                                        onChange={e => setFormData({ ...formData, isDepartmentRestricted: e.target.checked })}
                                    />
                                    <label htmlFor="isRestricted" className="ml-2 text-xs font-black text-slate-800 dark:text-slate-200">
                                        Restricted to Dept?
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="cartoon-btn bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2 text-xs font-black"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="cartoon-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-5 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                                >
                                    {currentVenue ? 'Save Changes' : 'Create Venue ✨'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
