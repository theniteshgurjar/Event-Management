"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
    Loader2,
    Search,
    Trash2,
    Edit,
    Shield,
    Plus,
    UserCheck,
    Key
} from "lucide-react";
import UserModal from "@/components/UserModal";
import { API_URL } from "@/config/api";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    club?: { id: number; name: string } | null;
    clubsManaged?: { id: number; name: string }[];
    createdAt: string;
}

export default function UsersPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchUsers();
    }, [currentUser]);

    const handleDelete = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const token = localStorage.getItem("token");
            await fetch(`${API_URL}/api/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter((u) => u.id !== userId));
        } catch (error) {
            console.error("Failed to delete user", error);
        }
    };

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="cartoon-sticker bg-rose-300 text-slate-950">
                            🛡️ User Access & Roles
                        </span>
                        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-indigo-600">
                            ← Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        User Directory & Permissions
                    </h1>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Manage university staff, deans, faculty advisors, and student coordinators
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl py-2 pl-9 pr-3 text-xs font-bold bg-white dark:bg-slate-900"
                        />
                    </div>
                    <button
                        onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
                        className="cartoon-btn w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add User
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="cartoon-card bg-white dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900 dark:border-slate-800 bg-amber-50 dark:bg-slate-950/60">
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">User Profile</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider">Role & Permissions</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider hidden sm:table-cell">Assignments</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider hidden md:table-cell">Joined</th>
                                <th className="px-5 py-3.5 font-black text-xs text-slate-900 dark:text-slate-200 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800/80">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                                        No users matching "{search}"
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u, idx) => {
                                    const avatarColors = ['bg-rose-300', 'bg-amber-300', 'bg-sky-300', 'bg-emerald-300', 'bg-indigo-300'];
                                    const avatarBg = avatarColors[idx % avatarColors.length];

                                    const roleBadge =
                                        u.role === 'ADMIN'
                                            ? 'bg-purple-300 text-slate-950'
                                            : u.role === 'DSW'
                                            ? 'bg-rose-300 text-slate-950'
                                            : u.role === 'HOD'
                                            ? 'bg-orange-300 text-slate-950'
                                            : u.role === 'FACULTY'
                                            ? 'bg-amber-300 text-slate-950'
                                            : u.role === 'CLUB_COORDINATOR'
                                            ? 'bg-sky-300 text-slate-950'
                                            : 'bg-slate-200 text-slate-950';

                                    return (
                                        <tr key={u.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-2xl ${avatarBg} border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center font-black text-slate-900 text-sm flex-shrink-0`}>
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-slate-900 dark:text-white text-sm block">
                                                            {u.name}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500">
                                                            {u.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`cartoon-badge ${roleBadge} text-[10px]`}>
                                                    {u.role === 'ADMIN' && <Shield className="h-3 w-3 mr-0.5" />}
                                                    {u.role}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                                                {u.clubsManaged && u.clubsManaged.length > 0 ? (
                                                    u.clubsManaged.map(c => (
                                                        <span key={c.id} className="cartoon-badge bg-emerald-100 text-emerald-950 text-[10px] mr-1">
                                                            Advisor: {c.name}
                                                        </span>
                                                    ))
                                                ) : u.club ? (
                                                    <span className="cartoon-badge bg-sky-100 text-sky-950 text-[10px]">
                                                        Coordinator: {u.club.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic font-medium">Standard Member</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-xs font-bold text-slate-500 hidden md:table-cell">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    {currentUser?.role === 'DSW' && u.role === 'ADMIN' ? (
                                                        <span
                                                            className="cartoon-btn bg-slate-100 dark:bg-slate-800 text-slate-400 p-1.5 opacity-60 cursor-not-allowed shadow-none"
                                                            title="Admin accounts cannot be edited by DSW"
                                                        >
                                                            <Shield className="h-3.5 w-3.5 text-slate-400" />
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                                                            className="cartoon-btn bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-1.5 shadow-[2px_2px_0px_#0f172a] hover:bg-amber-300 hover:text-slate-950"
                                                            title="Edit User"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                    {u.role !== 'ADMIN' && (
                                                        <button
                                                            onClick={() => handleDelete(u.id)}
                                                            className="cartoon-btn bg-rose-100 hover:bg-rose-200 text-rose-700 p-1.5 shadow-[2px_2px_0px_#0f172a]"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
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

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onSuccess={fetchUsers}
            />
        </div>
    );
}
