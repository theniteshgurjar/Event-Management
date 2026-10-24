'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (pathname === '/login' || pathname === '/' || pathname?.startsWith('/dashboard')) return null;

    return (
        <nav className="sticky top-0 z-50 border-b-2 border-slate-900 dark:border-slate-800 bg-[#fdfbf7]/90 dark:bg-[#0b0f19]/90 backdrop-blur-md transition-colors">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo Section */}
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center p-1 transition-transform">
                        <img
                            src="/logo.png"
                            alt="MITS Logo"
                            className="h-8 w-8 object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-black text-slate-900 dark:text-white leading-tight">EMS - MITS DU</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Event Management</span>
                    </div>
                </Link>

                {/* Navigation & User */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {user && (
                        <div className="hidden md:flex items-center gap-3">
                            <span className="cartoon-sticker text-[10px] bg-amber-200 dark:bg-slate-800 text-slate-900 dark:text-white">
                                {user.role}
                            </span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">{user.name}</span>
                        </div>
                    )}

                    <button
                        onClick={logout}
                        className="cartoon-btn bg-rose-200 hover:bg-rose-300 text-rose-950 px-3.5 py-1.5 text-xs font-black shadow-[2px_2px_0px_#0f172a] gap-1.5"
                    >
                        <LogOut className="h-3.5 w-3.5" /> Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
