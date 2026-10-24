"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    Loader2, 
    Plus, 
    Edit, 
    Trash2, 
    Shield, 
    Building, 
    Search, 
    X, 
    Eye, 
    CheckCircle2, 
    AlertCircle, 
    Users, 
    MapPin, 
    Calendar,
    LayoutGrid,
    List,
    ArrowUpRight,
    Sparkles,
    UserCheck,
    GraduationCap
} from "lucide-react";
import Link from 'next/link';
import { API_URL } from "@/config/api";

interface VenueItem {
    id: number;
    name: string;
    capacity: number;
}

interface ClubItem {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
    code: string;
    hodId: number | null;
    hod?: { id: number; name: string; email: string };
    venues?: VenueItem[];
    clubs?: ClubItem[];
    _count?: { venues: number; clubs: number; events: number; members: number };
}

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

export default function DepartmentsPage() {
    const { user, token, loading: authLoading } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDept, setCurrentDept] = useState<Department | null>(null);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'unassigned'>('all');

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        hodId: "" as string | number
    });

    useEffect(() => {
        if (!authLoading && token) {
            fetchDepartments();
            fetchUsers();
        }
    }, [authLoading, token]);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (err) {
            console.error("Failed to fetch departments", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleOpenModal = (dept?: Department) => {
        if (dept) {
            setCurrentDept(dept);
            setFormData({
                name: dept.name,
                code: dept.code,
                hodId: dept.hodId || ""
            });
        } else {
            setCurrentDept(null);
            setFormData({ name: "", code: "", hodId: "" });
        }
        setError("");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const url = currentDept
                ? `${API_URL}/api/departments/${currentDept.id}`
                : `${API_URL}/api/departments`;
            const method = currentDept ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    code: formData.code.trim().toUpperCase(),
                    hodId: formData.hodId ? Number(formData.hodId) : null
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Operation failed");

            fetchDepartments();
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this department? This might affect linked venues and events.")) return;
        try {
            const res = await fetch(`${API_URL}/api/departments/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete department");
            }
            setDepartments(prev => prev.filter(d => d.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredDepartments = departments.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.code.toLowerCase().includes(search.toLowerCase()) ||
            (d.hod?.name && d.hod.name.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        if (filterStatus === 'assigned') return Boolean(d.hodId);
        if (filterStatus === 'unassigned') return !d.hodId;
        return true;
    });

    // KPI Metrics calculation
    const totalDepts = departments.length;
    const deptsWithHod = departments.filter(d => d.hodId).length;
    const totalVenues = departments.reduce((acc, d) => acc + (d._count?.venues ?? d.venues?.length ?? 0), 0);
    const totalClubs = departments.reduce((acc, d) => acc + (d._count?.clubs ?? d.clubs?.length ?? 0), 0);

    const getCodeColor = (code: string) => {
        const palette = [
            'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
            'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
            'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
            'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
            'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
            'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
        ];
        const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return palette[hash % palette.length];
    };

    if (authLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <p className="text-sm font-bold text-slate-500">Loading department registry...</p>
            </div>
        );
    }

    if (user?.role !== "ADMIN" && user?.role !== "DSW") {
        return (
            <div className="cartoon-card p-12 text-center bg-white dark:bg-slate-900 max-w-lg mx-auto mt-12">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 border-2 border-slate-900 flex items-center justify-center mx-auto mb-3 text-rose-600">
                    <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">Access Restricted</h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-4">
                    Managing academic departments is reserved for Super Admins and DSW officials.
                </p>
                <Link href="/dashboard" className="cartoon-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs font-black">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="cartoon-sticker bg-cyan-300 text-slate-950">
                            🏛️ Faculty Units
                        </span>
                        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600">
                            ← Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Academic Departments
                    </h1>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Manage university faculties, course codes, and designated Heads of Department (HODs)
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => handleOpenModal()}
                        className="cartoon-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                    >
                        <Plus className="h-4 w-4 mr-1.5" /> Add Department
                    </button>
                </div>
            </div>

            {/* Quick Metrics KPI Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="cartoon-card p-4 bg-white dark:bg-slate-900 border-2 border-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Total Departments</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 border border-slate-900 flex items-center justify-center text-cyan-800 dark:text-cyan-300">
                            <Building className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {totalDepts}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                        Official academic branches
                    </p>
                </div>

                <div className="cartoon-card p-4 bg-white dark:bg-slate-900 border-2 border-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">HOD Appointed</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-slate-900 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
                            <UserCheck className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {deptsWithHod} <span className="text-xs text-slate-400 font-bold">/ {totalDepts}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                        {totalDepts - deptsWithHod === 0 ? "100% leadership assigned" : `${totalDepts - deptsWithHod} pending appointment`}
                    </p>
                </div>

                <div className="cartoon-card p-4 bg-white dark:bg-slate-900 border-2 border-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Managed Venues</span>
                        <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 border border-slate-900 flex items-center justify-center text-sky-800 dark:text-sky-300">
                            <MapPin className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {totalVenues}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                        Halls, labs & auditoriums
                    </p>
                </div>

                <div className="cartoon-card p-4 bg-white dark:bg-slate-900 border-2 border-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">Clubs & Units</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-slate-900 flex items-center justify-center text-amber-800 dark:text-amber-300">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {totalClubs}
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                        Active student bodies
                    </p>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 cartoon-card border-2 border-slate-900">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`cartoon-btn px-3 py-1.5 text-xs font-black shadow-none transition-colors ${
                            filterStatus === 'all'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                        All ({departments.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('assigned')}
                        className={`cartoon-btn px-3 py-1.5 text-xs font-black shadow-none transition-colors ${
                            filterStatus === 'assigned'
                                ? 'bg-emerald-400 text-slate-950'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                        HOD Assigned ({deptsWithHod})
                    </button>
                    <button
                        onClick={() => setFilterStatus('unassigned')}
                        className={`cartoon-btn px-3 py-1.5 text-xs font-black shadow-none transition-colors ${
                            filterStatus === 'unassigned'
                                ? 'bg-rose-400 text-slate-950'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                        HOD Missing ({totalDepts - deptsWithHod})
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by name, code, HOD..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl py-1.5 pl-8 pr-3 text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center rounded-xl border-2 border-slate-900 bg-slate-100 dark:bg-slate-800 p-0.5">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-lg transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                            title="Table View"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="cartoon-card p-12 text-center bg-white dark:bg-slate-900 border-2 border-slate-900">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-400 mb-2" />
                    <p className="text-xs font-bold text-slate-500">Loading departments...</p>
                </div>
            ) : filteredDepartments.length === 0 ? (
                <div className="cartoon-card p-12 text-center bg-white dark:bg-slate-900 border-2 border-slate-900">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Building className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">No departments found</h3>
                    <p className="text-xs font-medium text-slate-500 mb-4">
                        {search ? `No departments matched your search "${search}"` : "Get started by adding your first academic department."}
                    </p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="cartoon-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Department
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredDepartments.map((dept) => {
                        const venueCount = dept._count?.venues ?? dept.venues?.length ?? 0;
                        const clubCount = dept._count?.clubs ?? dept.clubs?.length ?? 0;
                        const eventCount = dept._count?.events ?? 0;

                        return (
                            <div 
                                key={dept.id} 
                                className="cartoon-card bg-white dark:bg-slate-900 border-2 border-slate-900 p-5 flex flex-col justify-between hover:translate-y-[-2px] transition-all shadow-[3px_3px_0px_#0f172a]"
                            >
                                <div>
                                    {/* Top Card Header */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono border-2 ${getCodeColor(dept.code)}`}>
                                                {dept.code}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">ID #{dept.id}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                href={`/dashboard/departments/${dept.id}`}
                                                className="cartoon-btn bg-slate-100 hover:bg-emerald-300 dark:bg-slate-800 text-slate-900 dark:text-white p-1.5 shadow-[2px_2px_0px_#0f172a]"
                                                title="View Department Hub"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                            </Link>
                                            <button
                                                onClick={() => handleOpenModal(dept)}
                                                className="cartoon-btn bg-slate-100 hover:bg-amber-300 dark:bg-slate-800 text-slate-900 dark:text-white p-1.5 shadow-[2px_2px_0px_#0f172a]"
                                                title="Edit Department"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dept.id)}
                                                className="cartoon-btn bg-rose-100 hover:bg-rose-200 text-rose-700 p-1.5 shadow-[2px_2px_0px_#0f172a]"
                                                title="Delete Department"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Department Name */}
                                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug mb-3">
                                        {dept.name}
                                    </h3>

                                    {/* Leadership Profile */}
                                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 mb-4">
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                                            Head of Department (HOD)
                                        </div>
                                        {dept.hod ? (
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-indigo-200 dark:bg-indigo-900 border-2 border-slate-900 text-slate-900 dark:text-indigo-200 flex items-center justify-center font-black text-xs shrink-0 shadow-[1px_1px_0px_#0f172a]">
                                                    {dept.hod.name.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                                        {dept.hod.name}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-500 truncate">
                                                        {dept.hod.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                                    <AlertCircle className="h-3.5 w-3.5" /> Not Assigned
                                                </span>
                                                <button
                                                    onClick={() => handleOpenModal(dept)}
                                                    className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                                                >
                                                    Assign HOD &rarr;
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Resource Counters & Footer Link */}
                                <div className="pt-3 border-t-2 border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-bold">
                                        <span className="flex items-center gap-1" title={`${venueCount} managed venues`}>
                                            <MapPin className="h-3.5 w-3.5 text-sky-500" />
                                            {venueCount}
                                        </span>
                                        <span className="flex items-center gap-1" title={`${clubCount} affiliated student clubs`}>
                                            <Users className="h-3.5 w-3.5 text-amber-500" />
                                            {clubCount}
                                        </span>
                                        {eventCount > 0 && (
                                            <span className="flex items-center gap-1" title={`${eventCount} department events`}>
                                                <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                                                {eventCount}
                                            </span>
                                        )}
                                    </div>

                                    <Link 
                                        href={`/dashboard/departments/${dept.id}`}
                                        className="text-xs font-black text-slate-900 dark:text-white hover:text-indigo-600 flex items-center gap-1 group"
                                    >
                                        Explore <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Table View */
                <div className="cartoon-card bg-white dark:bg-slate-900 border-2 border-slate-900 overflow-hidden shadow-[3px_3px_0px_#0f172a]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b-2 border-slate-900 dark:border-slate-800 bg-amber-50 dark:bg-slate-950/60">
                                    <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Department</th>
                                    <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Code</th>
                                    <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Head of Department</th>
                                    <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider text-center hidden md:table-cell">Venues</th>
                                    <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider text-center hidden md:table-cell">Clubs</th>
                                    <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800/80">
                                {filteredDepartments.map((dept) => {
                                    const venueCount = dept._count?.venues ?? dept.venues?.length ?? 0;
                                    const clubCount = dept._count?.clubs ?? dept.clubs?.length ?? 0;

                                    return (
                                        <tr key={dept.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <Link 
                                                    href={`/dashboard/departments/${dept.id}`}
                                                    className="font-black text-sm text-slate-900 dark:text-white hover:text-indigo-600 block"
                                                >
                                                    {dept.name}
                                                </Link>
                                                <span className="text-[10px] font-bold text-slate-400">Department ID #{dept.id}</span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-black border ${getCodeColor(dept.code)}`}>
                                                    {dept.code}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                {dept.hod ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 border border-slate-900 flex items-center justify-center font-black text-xs text-slate-900 dark:text-indigo-200 shrink-0">
                                                            {dept.hod.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                                                                {dept.hod.name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 font-medium">
                                                                {dept.hod.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="cartoon-badge bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 text-[10px]">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-center font-bold text-xs text-slate-700 dark:text-slate-300 hidden md:table-cell">
                                                {venueCount}
                                            </td>

                                            <td className="px-5 py-4 text-center font-bold text-xs text-slate-700 dark:text-slate-300 hidden md:table-cell">
                                                {clubCount}
                                            </td>

                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/dashboard/departments/${dept.id}`}
                                                        className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-1.5 shadow-[2px_2px_0px_#0f172a] hover:bg-emerald-300 hover:text-slate-950"
                                                        title="View Department Details"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleOpenModal(dept)}
                                                        className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-1.5 shadow-[2px_2px_0px_#0f172a] hover:bg-amber-300 hover:text-slate-950"
                                                        title="Edit Department"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(dept.id)}
                                                        className="cartoon-btn bg-rose-100 hover:bg-rose-200 text-rose-700 p-1.5 shadow-[2px_2px_0px_#0f172a]"
                                                        title="Delete Department"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
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

            {/* Department Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-pop">
                    <div className="cartoon-card bg-white dark:bg-slate-900 max-w-lg w-full p-6 sm:p-8 relative border-2 border-slate-900 shadow-[6px_6px_0px_#0f172a]">
                        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 dark:border-slate-800 mb-5">
                            <div className="flex items-center gap-2">
                                <span className="cartoon-sticker bg-amber-300 text-slate-950">
                                    {currentDept ? 'Update' : 'New'}
                                </span>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    {currentDept ? 'Edit Academic Department' : 'Create Academic Department'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="cartoon-btn p-1.5 bg-slate-100 hover:bg-rose-200 text-slate-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-400 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300 mb-4">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                                    Department Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Computer Science & Engineering"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                                    Department Code / Acronym *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. CSE"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-bold font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                                    Unique short code used for filtering and booking restrictions.
                                </span>
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                                    Designated Head of Department (HOD)
                                </label>
                                <select
                                    value={formData.hodId}
                                    onChange={e => setFormData({ ...formData, hodId: e.target.value })}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    <option value="">-- No HOD Assigned (Unassigned) --</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email}) {u.role ? `• [${u.role}]` : ''}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                                    Assigning a faculty member here grants them department-level event approval rights.
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="cartoon-btn bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-black"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="cartoon-btn bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                                >
                                    {currentDept ? 'Save Changes' : 'Create Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
