"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Save, UserPlus, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/config/api";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    club?: { id: number; name: string } | null;
    clubsManaged?: { id: number; name: string }[];
}

interface Club {
    id: number;
    name: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess: () => void;
}

export default function UserModal({ isOpen, onClose, user, onSuccess }: UserModalProps) {
    const { user: currentUser } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [clubId, setClubId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [clubs, setClubs] = useState<Club[]>([]);

    const isTargetAdmin = user?.role === 'ADMIN';
    const isCurrentDsw = currentUser?.role === 'DSW';
    const isDswRestricted = isCurrentDsw && isTargetAdmin;

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setName(user.name);
                setEmail(user.email);
                setPassword("");
                setRole(user.role);
                setClubId("");
            } else {
                setName("");
                setEmail("");
                setPassword("");
                setRole("STUDENT");
                setClubId("");
            }
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (isOpen) {
            const fetchClubs = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_URL}/api/clubs`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setClubs(data);
                    }
                } catch (e) {
                    console.error("Failed to load clubs for assignment", e);
                }
            };
            fetchClubs();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isDswRestricted) {
            alert("DSW is not authorized to change the role of an Admin.");
            return;
        }
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (user) {
                const res = await fetch(`${API_URL}/api/users/${user.id}/role`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ role }),
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => null);
                    throw new Error(errData?.error || errData?.message || "Failed to update role");
                }

                if (clubId) {
                    await fetch(`${API_URL}/api/users/${user.id}/assign-club`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ clubId: Number(clubId) }),
                    });
                }
            } else {
                const res = await fetch(`${API_URL}/api/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ name, email, password, role }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || "Failed to create user");
                }
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Failed to save user", error);
            alert(error.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-pop">
            <div className="cartoon-card bg-white dark:bg-slate-900 max-w-md w-full p-6 sm:p-8 relative">
                <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 dark:border-slate-800 mb-5">
                    <div className="flex items-center gap-2">
                        <span className="cartoon-sticker bg-amber-300 text-slate-950">
                            {user ? 'Update' : 'Create'}
                        </span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                            {user ? "Edit User Permissions" : "Add New User"}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="cartoon-btn p-1.5 bg-slate-100 hover:bg-rose-200 text-slate-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                            User Profile
                        </label>
                        {user ? (
                            <div className="cartoon-card p-3 bg-slate-50 dark:bg-slate-950/60 border">
                                <p className="text-sm font-black text-slate-900 dark:text-white">{user.name}</p>
                                <p className="text-xs font-bold text-slate-500">{user.email}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950"
                                />
                                <input
                                    type="email"
                                    required
                                    placeholder="Institutional Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950"
                                />
                                <input
                                    type="password"
                                    required
                                    placeholder="Initial Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950"
                                />
                            </div>
                        )}
                    </div>

                    {isDswRestricted && (
                        <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-900 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-300">
                            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                            <span>Super Admin accounts can only be modified by Super Admins. DSW accounts cannot change Admin roles.</span>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                            Assigned System Role
                        </label>
                        <select
                            value={role}
                            disabled={isDswRestricted}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <option value="STUDENT">Student</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="HOD">Head of Department (HOD)</option>
                            <option value="CLUB_COORDINATOR">Club Coordinator</option>
                            <option value="DSW">DSW (Dean Office)</option>
                            {!isCurrentDsw && <option value="ADMIN">Super Admin</option>}
                        </select>
                    </div>

                    {user && (
                        <div>
                            <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block mb-1">
                                Assign Club / Organization (Optional)
                            </label>
                            <select
                                value={clubId}
                                disabled={isDswRestricted}
                                onChange={(e) => setClubId(e.target.value)}
                                className="w-full rounded-xl py-2 px-3 text-sm font-bold bg-slate-50 dark:bg-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <option value="">Select a club...</option>
                                {clubs.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cartoon-btn flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2.5 text-xs font-black"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isDswRestricted}
                            className="cartoon-btn flex-1 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed text-slate-950 py-2.5 text-xs font-black shadow-[3px_3px_0px_#0f172a]"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            {isDswRestricted ? "Admin Protected 🔒" : user ? "Save Changes" : "Confirm User ✨"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
