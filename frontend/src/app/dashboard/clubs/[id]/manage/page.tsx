'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/config/api';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Users,
    Mail,
    Phone,
    Image as ImageIcon,
    Crown,
    Award,
    Sparkles,
    AlertCircle
} from 'lucide-react';

export default function ManageClubTeamPage({ params }: { params: { id: string } }) {
    const { user, token } = useAuth();
    const router = useRouter();
    const [clubId, setClubId] = useState('');
    const [clubName, setClubName] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form Fields
    const [formData, setFormData] = useState({
        logoUrl: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        president: '',
        treasurer: '',
        facultyAdvisorId: '',
        presidentEnrollment: '',
        treasurerEnrollment: ''
    });

    const [vicePresidents, setVicePresidents] = useState<string[]>(['']);
    const [vicePresidentsEnrollment, setVicePresidentsEnrollment] = useState<string[]>(['']);

    const [secretaries, setSecretaries] = useState<string[]>(['']);
    const [secretariesEnrollment, setSecretariesEnrollment] = useState<string[]>(['']);

    useEffect(() => {
        Promise.resolve(params).then((p) => {
            setClubId(p.id);
            fetchClubData(p.id);
        });
    }, [params, user]);

    const fetchClubData = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/api/clubs/${id}`);
            if (res.ok) {
                const data = await res.json();
                setClubName(data.name || '');
                setFormData({
                    logoUrl: data.logoUrl || '',
                    description: data.description || '',
                    contactEmail: data.contactEmail || '',
                    contactPhone: data.contactPhone || '',
                    president: data.president || '',
                    treasurer: data.treasurer || '',
                    facultyAdvisorId: data.facultyAdvisorId || '',
                    presidentEnrollment: data.presidentEnrollment || '',
                    treasurerEnrollment: data.treasurerEnrollment || ''
                });

                if (data.vicePresidents && data.vicePresidents.length > 0) {
                    setVicePresidents(data.vicePresidents);
                    const vpe = data.vicePresidentsEnrollment || [];
                    while (vpe.length < data.vicePresidents.length) vpe.push('');
                    setVicePresidentsEnrollment(vpe);
                }

                if (data.secretaries && data.secretaries.length > 0) {
                    setSecretaries(data.secretaries);
                    const se = data.secretariesEnrollment || [];
                    while (se.length < data.secretaries.length) se.push('');
                    setSecretariesEnrollment(se);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleArrayChange = (setter: any, list: string[], index: number, value: string) => {
        const newList = [...list];
        newList[index] = value;
        setter(newList);
    };

    const addField = (
        nameSetter: any, nameList: string[],
        enrollSetter: any, enrollList: string[],
        max: number
    ) => {
        if (nameList.length < max) {
            nameSetter([...nameList, '']);
            enrollSetter([...enrollList, '']);
        }
    };

    const removeField = (
        nameSetter: any, nameList: string[],
        enrollSetter: any, enrollList: string[],
        index: number
    ) => {
        if (nameList.length > 1) {
            nameSetter(nameList.filter((_, i) => i !== index));
            enrollSetter(enrollList.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const filteredVPs: string[] = [];
        const filteredVPEnrolls: string[] = [];
        vicePresidents.forEach((vp, idx) => {
            if (vp.trim() !== '') {
                filteredVPs.push(vp);
                filteredVPEnrolls.push(vicePresidentsEnrollment[idx] || '');
            }
        });

        const filteredSecs: string[] = [];
        const filteredSecEnrolls: string[] = [];
        secretaries.forEach((sec, idx) => {
            if (sec.trim() !== '') {
                filteredSecs.push(sec);
                filteredSecEnrolls.push(secretariesEnrollment[idx] || '');
            }
        });

        const payload: any = {
            logoUrl: formData.logoUrl,
            description: formData.description,
            contactEmail: formData.contactEmail,
            contactPhone: formData.contactPhone,
            president: formData.president,
            presidentEnrollment: formData.presidentEnrollment,
            treasurer: formData.treasurer,
            treasurerEnrollment: formData.treasurerEnrollment
        };

        if (filteredVPs.length > 0) {
            payload.vicePresidents = filteredVPs;
            payload.vicePresidentsEnrollment = filteredVPEnrolls;
        }
        if (filteredSecs.length > 0) {
            payload.secretaries = filteredSecs;
            payload.secretariesEnrollment = filteredSecEnrolls;
        }

        try {
            const res = await fetch(`${API_URL}/api/clubs/${clubId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push(`/dashboard/clubs/${clubId}`);
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to update details');
            }
        } catch (err: any) {
            setError(err.message || 'Error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[4px_4px_0px_#0f172a] animate-bounce flex items-center justify-center text-2xl mb-4">
                    ⚙️
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Loading Club Settings...</h2>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16 max-w-4xl mx-auto">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/clubs/${clubId}`}
                        className="cartoon-btn bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-900 dark:text-white px-3.5 py-2 text-xs font-black"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Back to Club Profile
                    </Link>
                    <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                        Admin Mode
                    </span>
                </div>
            </div>

            {/* Header Card */}
            <div className="cartoon-card bg-gradient-to-r from-amber-100 via-yellow-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="cartoon-sticker bg-rose-300 text-slate-950 text-xs mb-2">
                            Team & Profile Management
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                            {clubName || 'Manage Club Details'}
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                            Update public branding, contact desk, and student leadership council seats.
                        </p>
                    </div>
                    <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-amber-300 border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] items-center justify-center text-2xl">
                        👑
                    </div>
                </div>
            </div>

            {error && (
                <div className="cartoon-card bg-rose-100 border-rose-500 p-4 flex items-center gap-3 text-rose-950 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Section 1: Branding & Description */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <span className="cartoon-sticker bg-yellow-200 text-slate-950 text-xs">
                            🎨 Branding & Description
                        </span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Club Description
                            </label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="State your club mission, initiatives, weekly meetups, and member benefits..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Logo Image URL
                            </label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="url"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    className="flex-1 p-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder="https://example.com/club-logo.png"
                                />
                                {formData.logoUrl && (
                                    <div className="w-11 h-11 rounded-xl bg-amber-200 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] overflow-hidden shrink-0">
                                        <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Contact Information */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-xs">
                            📡 Contact Information
                        </span>
                        <Mail className="w-4 h-4 text-cyan-600" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Official Inquiries Email
                            </label>
                            <input
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                className="w-full p-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="club@mits.ac.in"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Helpdesk Phone Number
                            </label>
                            <input
                                type="text"
                                value={formData.contactPhone}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                className="w-full p-2.5 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Core Leadership (President & Treasurer) */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                            👑 Core Leadership
                        </span>
                        <Crown className="w-4 h-4 text-amber-600" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* President */}
                        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-slate-800/60 border-2 border-slate-900 dark:border-slate-700 space-y-3">
                            <span className="cartoon-sticker bg-amber-300 text-slate-950 text-[10px]">
                                President
                            </span>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.president}
                                    onChange={(e) => setFormData({ ...formData, president: e.target.value })}
                                    className="w-full p-2 text-sm font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                    Enrollment Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.presidentEnrollment}
                                    onChange={(e) => setFormData({ ...formData, presidentEnrollment: e.target.value })}
                                    className="w-full p-2 text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    placeholder="0901CS231000"
                                />
                            </div>
                        </div>

                        {/* Treasurer */}
                        <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-slate-800/60 border-2 border-slate-900 dark:border-slate-700 space-y-3">
                            <span className="cartoon-sticker bg-rose-300 text-slate-950 text-[10px]">
                                Treasurer
                            </span>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.treasurer}
                                    onChange={(e) => setFormData({ ...formData, treasurer: e.target.value })}
                                    className="w-full p-2 text-sm font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    placeholder="e.g. Jane Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                    Enrollment Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.treasurerEnrollment}
                                    onChange={(e) => setFormData({ ...formData, treasurerEnrollment: e.target.value })}
                                    className="w-full p-2 text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    placeholder="0901IT231000"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Vice Presidents (1-2) */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="cartoon-sticker bg-cyan-300 text-slate-950 text-xs">
                                ⚡ Vice Presidents (Up to 2)
                            </span>
                        </div>
                        {vicePresidents.length < 2 && (
                            <button
                                type="button"
                                onClick={() => addField(setVicePresidents, vicePresidents, setVicePresidentsEnrollment, vicePresidentsEnrollment, 2)}
                                className="cartoon-btn bg-cyan-300 hover:bg-cyan-400 text-slate-950 px-3 py-1 text-xs font-black"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add VP Seat
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {vicePresidents.map((vp, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-cyan-50/50 dark:bg-slate-800/50 border-2 border-slate-900 flex flex-col sm:flex-row gap-3 items-center">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                                    <input
                                        type="text"
                                        value={vp}
                                        onChange={(e) => handleArrayChange(setVicePresidents, vicePresidents, idx, e.target.value)}
                                        className="w-full p-2 text-sm font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder={`Vice President #${idx + 1} Name`}
                                    />
                                    <input
                                        type="text"
                                        value={vicePresidentsEnrollment[idx]}
                                        onChange={(e) => handleArrayChange(setVicePresidentsEnrollment, vicePresidentsEnrollment, idx, e.target.value)}
                                        className="w-full p-2 text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="Enrollment Number"
                                    />
                                </div>
                                {vicePresidents.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeField(setVicePresidents, vicePresidents, setVicePresidentsEnrollment, vicePresidentsEnrollment, idx)}
                                        className="cartoon-btn bg-rose-400 hover:bg-rose-500 text-slate-950 p-2 text-xs"
                                        title="Remove seat"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section 5: Secretaries (1-2) */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <span className="cartoon-sticker bg-emerald-300 text-slate-950 text-xs">
                                ✍️ Secretaries (Up to 2)
                            </span>
                        </div>
                        {secretaries.length < 2 && (
                            <button
                                type="button"
                                onClick={() => addField(setSecretaries, secretaries, setSecretariesEnrollment, secretariesEnrollment, 2)}
                                className="cartoon-btn bg-emerald-300 hover:bg-emerald-400 text-slate-950 px-3 py-1 text-xs font-black"
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add Secretary Seat
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {secretaries.map((sec, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-slate-800/50 border-2 border-slate-900 flex flex-col sm:flex-row gap-3 items-center">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
                                    <input
                                        type="text"
                                        value={sec}
                                        onChange={(e) => handleArrayChange(setSecretaries, secretaries, idx, e.target.value)}
                                        className="w-full p-2 text-sm font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder={`Secretary #${idx + 1} Name`}
                                    />
                                    <input
                                        type="text"
                                        value={secretariesEnrollment[idx]}
                                        onChange={(e) => handleArrayChange(setSecretariesEnrollment, secretariesEnrollment, idx, e.target.value)}
                                        className="w-full p-2 text-sm font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        placeholder="Enrollment Number"
                                    />
                                </div>
                                {secretaries.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeField(setSecretaries, secretaries, setSecretariesEnrollment, secretariesEnrollment, idx)}
                                        className="cartoon-btn bg-rose-400 hover:bg-rose-500 text-slate-950 p-2 text-xs"
                                        title="Remove seat"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
                    <Link
                        href={`/dashboard/clubs/${clubId}`}
                        className="cartoon-btn bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-900 dark:text-white px-6 py-3 text-sm font-black w-full sm:w-auto"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="cartoon-btn bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 text-sm font-black w-full sm:w-auto shadow-[4px_4px_0px_#0f172a] disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving Changes...' : 'Save Club Details 🚀'}
                    </button>
                </div>

            </form>

        </div>
    );
}
