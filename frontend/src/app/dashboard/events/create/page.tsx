'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Trash2,
    Plus,
    Calendar,
    Clock,
    MapPin,
    Users,
    Info,
    Building2,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Award,
    Send
} from 'lucide-react';
import { API_URL } from '@/config/api';

interface Club {
    id: number;
    name: string;
    facultyAdvisorId?: number;
    coordinators?: { id: number }[];
}

interface Venue {
    id: number;
    name: string;
    capacity: number;
    facilities?: string;
}

interface Department {
    id: number;
    name: string;
}

const MAIN_CATEGORIES = [
    'Academic',
    'Extra-Curricular'
];

const SUBCATEGORIES = [
    'Workshop',
    'Seminar',
    'Competition',
    'Heritage Walk'
];

const SDGS = [
    '1. No Poverty',
    '2. Zero Hunger',
    '3. Good Health and Well-being',
    '4. Quality Education',
    '5. Gender Equality',
    '6. Clean Water and Sanitation',
    '7. Affordable and Clean Energy',
    '8. Decent Work and Economic Growth',
    '9. Industry, Innovation and Infrastructure',
    '10. Reduced Inequality',
    '11. Sustainable Cities and Communities',
    '12. Responsible Consumption and Production',
    '13. Climate Action',
    '14. Life Below Water',
    '15. Life on Land',
    '16. Peace, Justice and Strong Institutions',
    '17. Partnerships for the Goals'
];

export default function CreateEventPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (user && (user.role === 'STUDENT' || user.role === 'DSW')) {
            router.push('/dashboard/events');
        }
    }, [user, router]);

    const [clubs, setClubs] = useState<Club[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Form State ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mainCategory, setMainCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [customSubCategory, setCustomSubCategory] = useState('');
    const [sdg, setSdg] = useState('');

    // Organizer Logic
    const [organizerId, setOrganizerId] = useState('');
    const [collaboratingClubIds, setCollaboratingClubIds] = useState<string[]>([]);

    // Details
    const [targetAudience, setTargetAudience] = useState('Only MITS');
    const [requirements, setRequirements] = useState<string[]>(['']);

    // Guests
    const [externalGuests, setExternalGuests] = useState<{ name: string; designation: string; organization: string }[]>([]);
    const [internalGuests, setInternalGuests] = useState<{ name: string; role: string; department: string }[]>([]);

    // Schedule Logic
    const [durationDays, setDurationDays] = useState(1);
    const [schedule, setSchedule] = useState<{
        dayNumber: number;
        venueId: string;
        startTime: string;
        endTime: string;
    }[]>([]);

    // Prevent DSW from proposing events
    useEffect(() => {
        if (user && user.role === 'DSW') {
            router.replace('/dashboard/events');
        }
    }, [user, router]);

    // Initialize Schedule when Duration Changes
    useEffect(() => {
        setSchedule(prev => prev.filter(s => s.dayNumber <= durationDays));
    }, [durationDays]);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clubsRes, venuesRes, deptsRes] = await Promise.all([
                    fetch(`${API_URL}/api/clubs`),
                    fetch(`${API_URL}/api/venues`),
                    fetch(`${API_URL}/api/departments`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (clubsRes.ok) {
                    const allClubs: Club[] = await clubsRes.json();
                    setClubs(allClubs);

                    let myClubId = '';
                    if (user?.role === 'CLUB_COORDINATOR') {
                        const myClub = allClubs.find(c => c.coordinators?.some(coord => Number(coord.id) === Number(user?.id)));
                        if (myClub) myClubId = myClub.id.toString();
                    } else if (['FACULTY', 'HOD'].includes(user?.role || '')) {
                        const myClub = allClubs.find(c => c.facultyAdvisorId === Number(user?.id));
                        if (myClub) myClubId = myClub.id.toString();
                    }

                    if (myClubId) setOrganizerId(`club_${myClubId}`);
                    else if (searchParams.get('clubId')) setOrganizerId(`club_${searchParams.get('clubId')}`);
                }

                if (venuesRes.ok) {
                    const venuesData = await venuesRes.json();
                    setVenues(venuesData);
                }

                if (deptsRes.ok) {
                    const tempDepts = await deptsRes.json();
                    setDepartments(tempDepts);
                }

            } catch (err) {
                console.error("Error fetching data", err);
            }
        };

        fetchData();
    }, [user, searchParams, token]);

    // Collaborator Toggling
    const handleCollaboratorToggle = (clubIdStr: string) => {
        if (collaboratingClubIds.includes(clubIdStr)) {
            setCollaboratingClubIds(prev => prev.filter(id => id !== clubIdStr));
        } else {
            if (collaboratingClubIds.length >= 2) return;
            setCollaboratingClubIds(prev => [...prev, clubIdStr]);
        }
    };

    // Schedule Slot Helpers
    const addScheduleSlot = (dayNumber: number) => {
        const daySlots = schedule.filter(s => s.dayNumber === dayNumber);
        if (daySlots.length >= 2) return;

        setSchedule(prev => [...prev, {
            dayNumber,
            venueId: '',
            startTime: '',
            endTime: ''
        }]);
    };

    const removeScheduleSlot = (index: number) => {
        setSchedule(prev => prev.filter((_, i) => i !== index));
    };

    const updateScheduleSlot = (index: number, field: string, value: string) => {
        setSchedule(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    // Guests Helpers
    const addExternalGuest = () => {
        if (externalGuests.length >= 5) return;
        setExternalGuests(prev => [...prev, { name: '', designation: '', organization: '' }]);
    };

    const updateExternalGuest = (index: number, field: string, value: string) => {
        setExternalGuests(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const removeExternalGuest = (index: number) => {
        setExternalGuests(prev => prev.filter((_, i) => i !== index));
    };

    const addInternalGuest = () => {
        if (internalGuests.length >= 5) return;
        setInternalGuests(prev => [...prev, { name: '', role: '', department: '' }]);
    };

    const updateInternalGuest = (index: number, field: string, value: string) => {
        setInternalGuests(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const removeInternalGuest = (index: number) => {
        setInternalGuests(prev => prev.filter((_, i) => i !== index));
    };

    // Requirements Helpers
    const addRequirement = () => {
        if (requirements.length >= 5) return;
        setRequirements(prev => [...prev, '']);
    };

    const updateRequirement = (index: number, value: string) => {
        setRequirements(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const removeRequirement = (index: number) => {
        setRequirements(prev => prev.filter((_, i) => i !== index));
    };

    // Form Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!title.trim() || !description.trim()) {
                throw new Error('Title and Description are required.');
            }
            if (!mainCategory || !subCategory || !sdg) {
                throw new Error('Please select Main Category, Subcategory, and Primary SDG.');
            }
            if (subCategory === 'Other' && !customSubCategory.trim()) {
                throw new Error('Please enter custom subcategory name.');
            }
            if (!organizerId) {
                throw new Error('Please select an organizing entity.');
            }
            if (schedule.length === 0) {
                throw new Error('Please allocate at least one venue/time slot in the schedule.');
            }

            for (const slot of schedule) {
                if (!slot.startTime || !slot.endTime) {
                    throw new Error(`Day ${slot.dayNumber} slot requires both Start Time and End Time.`);
                }
                if (new Date(slot.startTime) >= new Date(slot.endTime)) {
                    throw new Error(`Day ${slot.dayNumber} End Time must be strictly after Start Time.`);
                }
            }

            let payloadClubId: number | null = null;
            let payloadDeptId: number | null = null;

            if (organizerId.startsWith('club_')) {
                payloadClubId = parseInt(organizerId.split('_')[1]);
            } else if (organizerId.startsWith('dept_')) {
                payloadDeptId = parseInt(organizerId.split('_')[1]);
            }

            const body = {
                title,
                description,
                clubId: payloadClubId,
                departmentId: payloadDeptId,
                collaboratingClubIds,
                purpose: "See Description",
                targetAudience,
                estimatedCost: 0,
                mainCategory,
                subCategory: subCategory === 'Other' ? customSubCategory.trim() : subCategory,
                sdg,
                durationDays,
                schedule,
                externalGuests,
                internalGuests,
                requirements: requirements.filter(r => r.trim() !== '')
            };

            const res = await fetch(`${API_URL}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit proposal');

            router.push('/dashboard/events');
        } catch (err: any) {
            setError(err.message || 'An error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    if (user?.role === 'STUDENT' || user?.role === 'DSW') {
        return (
            <div className="p-8 max-w-lg mx-auto text-center space-y-4">
                <div className="cartoon-card bg-rose-100 p-8 space-y-3">
                    <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
                    <h2 className="text-xl font-black text-rose-950">Proposal Access Restricted</h2>
                    <p className="text-xs text-rose-800 font-medium">
                        {user.role === 'STUDENT'
                            ? 'Students cannot submit event proposals. Proposals can only be drafted by designated Club Coordinators or Faculty Advisors.'
                            : 'DSW is an approving authority and cannot propose events.'}
                    </p>
                    <Link href="/dashboard/events" className="cartoon-btn bg-slate-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-black inline-block mt-2">
                        View Approved Events
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16 max-w-5xl mx-auto">
            
            {/* Top Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/events"
                        className="cartoon-btn bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-900 dark:text-white px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-black inline-flex items-center"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                        Back to Events
                    </Link>
                   
                </div>
            </div>

            {/* Official MITS Institutional Letterhead Banner */}
            <div className="cartoon-card bg-white p-2 sm:p-4 overflow-hidden flex items-center justify-center">
                <div className="relative w-full h-24 sm:h-32 md:h-36 max-w-4xl">
                    <Image
                        src="/report-header.png"
                        alt="Madhav Institute of Technology & Science"
                        fill
                        priority
                        className="object-contain"
                    />
                </div>
            </div>

            {error && (
                <div className="cartoon-card bg-rose-100 border-rose-500 p-4 flex items-center gap-3 text-rose-950 font-bold text-sm">
                    <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* SECTION 1: Event Identity & Categories */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <span className="cartoon-sticker bg-yellow-200 text-slate-950 text-xs">
                            1. Event Identity & Purpose
                        </span>
                        <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Event Title *
                            </label>
                            <input
                                required
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-3 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="e.g. MITS National Hackathon 2026"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Narrative Description & Objectives *
                            </label>
                            <textarea
                                required
                                rows={4}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full p-3 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="State event vision, key learning outcomes, expected attendees, and planned sessions..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Main Category *
                                </label>
                                <select
                                    required
                                    value={mainCategory}
                                    onChange={e => setMainCategory(e.target.value)}
                                    className="w-full p-2.5 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                >
                                    <option value="" disabled>Select Category</option>
                                    {MAIN_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Subcategory *
                                </label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {[...SUBCATEGORIES, 'Other'].map(cat => {
                                        const isSelected = subCategory === cat;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setSubCategory(cat)}
                                                className={`cartoon-btn px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-black ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_#0f172a]'
                                                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        );
                                    })}
                                </div>
                                {subCategory === 'Other' && (
                                    <input
                                        required
                                        type="text"
                                        value={customSubCategory}
                                        onChange={e => setCustomSubCategory(e.target.value)}
                                        className="w-full mt-2 p-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                                        placeholder="Enter custom subcategory..."
                                    />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                Sustainable Development Goal (SDG) Alignment *
                            </label>
                            <select
                                required
                                value={sdg}
                                onChange={e => setSdg(e.target.value)}
                                className="w-full p-2.5 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                <option value="" disabled>Select UN SDG Goal Supported</option>
                                {SDGS.map((goal, idx) => (
                                    <option key={idx} value={goal}>{goal}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: Organizers & Collaborators */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <span className="cartoon-sticker bg-cyan-200 text-slate-950 text-xs">
                            2. Organizing Council & Alliances
                        </span>
                        <Users className="w-4 h-4 text-cyan-600" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                Primary Organizing Entity *
                            </label>
                            <select
                                required
                                value={organizerId}
                                onChange={e => setOrganizerId(e.target.value)}
                                className="w-full p-2.5 text-sm font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                            >
                                <option value="" disabled>-- Select Organizing Body --</option>

                                {['FACULTY', 'HOD', 'ADMIN'].includes(user?.role || '') && (
                                    <option value="independent">🏛️ Independent Event (Campus-wide / Deanery)</option>
                                )}

                                {['FACULTY', 'HOD', 'ADMIN'].includes(user?.role || '') && departments.length > 0 && (
                                    <optgroup label="Academic Departments">
                                        {departments.map(dept => (
                                            <option key={`dept_${dept.id}`} value={`dept_${dept.id}`}>
                                                Department of {dept.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}

                                {clubs.length > 0 && (
                                    <optgroup label="Student Clubs & Societies">
                                        {clubs.filter(c => {
                                            if (user?.role === 'ADMIN' || user?.role === 'HOD') return true;
                                            if (user?.role === 'CLUB_COORDINATOR') {
                                                return c.coordinators?.some(coord => Number(coord.id) === Number(user?.id));
                                            }
                                            if (['FACULTY', 'HOD'].includes(user?.role || '')) {
                                                return c.facultyAdvisorId === Number(user?.id);
                                            }
                                            return false;
                                        }).map(c => (
                                            <option key={`club_${c.id}`} value={`club_${c.id}`}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Collaborating Clubs (Optional, Max 2)
                                </label>
                                <span className="cartoon-badge bg-slate-100 dark:bg-slate-800 text-[10px]">
                                    {collaboratingClubIds.length}/2 Selected
                                </span>
                            </div>

                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-900 max-h-44 overflow-y-auto space-y-1.5 custom-scrollbar">
                                {clubs.filter(c => `club_${c.id}` !== organizerId).map(c => {
                                    const isChecked = collaboratingClubIds.includes(c.id.toString());
                                    const isDisabled = !isChecked && collaboratingClubIds.length >= 2;

                                    return (
                                        <label
                                            key={c.id}
                                            className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                                                isChecked
                                                    ? 'bg-amber-100 dark:bg-slate-700 font-bold'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 font-medium'
                                            } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleCollaboratorToggle(c.id.toString())}
                                                disabled={isDisabled}
                                                className="w-4 h-4 rounded border-2 border-slate-900 text-indigo-600 focus:ring-0"
                                            />
                                            <span className="text-xs text-slate-800 dark:text-slate-200">
                                                {c.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: Multi-Day Schedule & Auditorium Booking */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <div>
                            <span className="cartoon-sticker bg-emerald-300 text-slate-950 text-xs">
                                3. Schedule & Venue Slots
                            </span>
                            <p className="text-xs font-bold text-slate-500 mt-1">
                                Reserve Colloquium, SH Halls, or Open Grounds with exact minutes
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                                Duration:
                            </span>
                            <select
                                value={durationDays}
                                onChange={e => setDurationDays(parseInt(e.target.value))}
                                className="p-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 rounded-lg text-xs font-black"
                            >
                                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                    <option key={d} value={d}>{d} Day{d > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {Array.from({ length: durationDays }).map((_, i) => {
                            const dayNum = i + 1;
                            const daySlots = schedule.filter(s => s.dayNumber === dayNum);

                            return (
                                <div
                                    key={dayNum}
                                    className="cartoon-card bg-slate-50 dark:bg-slate-800/60 p-4 space-y-4"
                                >
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <span className="cartoon-badge bg-amber-300 text-slate-950 text-xs">
                                                📅 Day {dayNum}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500">
                                                {daySlots.length}/2 slots booked
                                            </span>
                                        </div>

                                        {daySlots.length < 2 && (
                                            <button
                                                type="button"
                                                onClick={() => addScheduleSlot(dayNum)}
                                                className="cartoon-btn bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-2.5 py-1 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-black inline-flex items-center"
                                            >
                                                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                                                Add Venue Slot
                                            </button>
                                        )}
                                    </div>

                                    {daySlots.length === 0 ? (
                                        <div className="p-5 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-400">
                                            No Venue slot booked for Day {dayNum}. Click "+ Add Venue Slot" above.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {daySlots.map(slot => {
                                                const globalIndex = schedule.indexOf(slot);
                                                return (
                                                    <div
                                                        key={globalIndex}
                                                        className="cartoon-card bg-white dark:bg-slate-900 p-3.5 flex flex-col md:flex-row gap-3 items-start md:items-end"
                                                    >
                                                        <div className="w-full md:flex-1">
                                                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                                                                Campus Venue / Hall
                                                            </label>
                                                            <select
                                                                value={slot.venueId}
                                                                onChange={e => updateScheduleSlot(globalIndex, 'venueId', e.target.value)}
                                                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 text-xs font-bold"
                                                            >
                                                                <option value="">No Physical Hall / Virtual</option>
                                                                {venues.map(v => (
                                                                    <option key={v.id} value={v.id}>
                                                                        {v.name} (Cap: {v.capacity})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="w-full md:w-44">
                                                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                                                                Start Date & Time
                                                            </label>
                                                            <input
                                                                required
                                                                type="datetime-local"
                                                                value={slot.startTime}
                                                                onChange={e => updateScheduleSlot(globalIndex, 'startTime', e.target.value)}
                                                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 text-xs font-bold"
                                                            />
                                                        </div>

                                                        <div className="w-full md:w-44">
                                                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                                                                End Date & Time
                                                            </label>
                                                            <input
                                                                required
                                                                type="datetime-local"
                                                                value={slot.endTime}
                                                                onChange={e => updateScheduleSlot(globalIndex, 'endTime', e.target.value)}
                                                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 text-xs font-bold"
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeScheduleSlot(globalIndex)}
                                                            className="cartoon-btn bg-rose-300 hover:bg-rose-400 text-slate-950 p-1.5 sm:p-2 text-xs"
                                                            title="Remove slot"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* SECTION 4: Guests & VIP Dignitaries */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <span className="cartoon-sticker bg-amber-300 text-slate-950 text-xs">
                            4. Guests & Keynote Dignitaries
                        </span>
                        <Award className="w-4 h-4 text-amber-600" />
                    </div>

                    <div className="space-y-6">
                        {/* External Guests */}
                        <div className="cartoon-card bg-amber-50/50 dark:bg-slate-800/50 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                                        External Guests
                                    </h4>
                                    <p className="text-[11px] font-medium text-slate-500">Up to 5 external speakers</p>
                                </div>
                                {externalGuests.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={addExternalGuest}
                                        className="cartoon-btn bg-amber-300 hover:bg-amber-400 text-slate-950 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-black inline-flex items-center"
                                    >
                                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                                        Add Guest
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {externalGuests.map((guest, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border-2 border-slate-900">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Guest Name"
                                            value={guest.name}
                                            onChange={e => updateExternalGuest(idx, 'name', e.target.value)}
                                            className="w-full sm:flex-1 p-2 text-xs font-bold bg-slate-50 dark:bg-slate-800"
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Designation"
                                            value={guest.designation}
                                            onChange={e => updateExternalGuest(idx, 'designation', e.target.value)}
                                            className="w-full sm:flex-1 p-2 text-xs font-medium bg-slate-50 dark:bg-slate-800"
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Organization"
                                            value={guest.organization}
                                            onChange={e => updateExternalGuest(idx, 'organization', e.target.value)}
                                            className="w-full sm:flex-1 p-2 text-xs font-medium bg-slate-50 dark:bg-slate-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExternalGuest(idx)}
                                            className="cartoon-btn bg-rose-300 hover:bg-rose-400 text-slate-950 p-1.5 sm:p-2 text-xs shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {externalGuests.length === 0 && (
                                    <p className="text-xs text-slate-400 italic">No external speakers added yet.</p>
                                )}
                            </div>
                        </div>

                        {/* In-House Guests */}
                        <div className="cartoon-card bg-cyan-50/50 dark:bg-slate-800/50 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                                        In-House Dignitaries
                                    </h4>
                                    <p className="text-[11px] font-medium text-slate-500">Up to 5 university invitees</p>
                                </div>
                                {internalGuests.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={addInternalGuest}
                                        className="cartoon-btn bg-cyan-300 hover:bg-cyan-400 text-slate-950 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-black inline-flex items-center"
                                    >
                                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                                        Add In-House
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {internalGuests.map((guest, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border-2 border-slate-900">
                                        <input
                                            required
                                            type="text"
                                            placeholder="Faculty / Dean Name"
                                            value={guest.name}
                                            onChange={e => updateInternalGuest(idx, 'name', e.target.value)}
                                            className="w-full sm:flex-1 p-2 text-xs font-bold bg-slate-50 dark:bg-slate-800"
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Role / Title"
                                            value={guest.role}
                                            onChange={e => updateInternalGuest(idx, 'role', e.target.value)}
                                            className="w-full sm:flex-1 p-2 text-xs font-medium bg-slate-50 dark:bg-slate-800"
                                        />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Department"
                                            value={guest.department}
                                            onChange={e => updateInternalGuest(idx, 'department', e.target.value)}
                                            className="w-full sm:flex-1 p-2 text-xs font-medium bg-slate-50 dark:bg-slate-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeInternalGuest(idx)}
                                            className="cartoon-btn bg-rose-300 hover:bg-rose-400 text-slate-950 p-1.5 sm:p-2 text-xs shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {internalGuests.length === 0 && (
                                    <p className="text-xs text-slate-400 italic">No in-house guests added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 5: Logistics & Audience */}
                <div className="cartoon-card bg-white dark:bg-slate-900 p-6 sm:p-7 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-slate-800">
                        <span className="cartoon-sticker bg-rose-300 text-slate-950 text-xs">
                            5. Logistics, Sound & Target Audience
                        </span>
                        <Info className="w-4 h-4 text-rose-600" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                                    Special Logistics & Requirements
                                </label>
                                {requirements.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={addRequirement}
                                        className="cartoon-btn bg-yellow-300 text-slate-950 px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[10px] sm:text-xs font-bold"
                                    >
                                        + Item
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {requirements.map((req, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={req}
                                            onChange={e => updateRequirement(idx, e.target.value)}
                                            placeholder={`e.g. Wireless Microphones, Extra Extension Boards`}
                                            className="flex-1 p-2 text-xs font-medium bg-slate-50 dark:bg-slate-800"
                                        />
                                        {requirements.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeRequirement(idx)}
                                                className="cartoon-btn bg-rose-300 text-slate-950 p-1.5 sm:p-2 text-xs"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 block">
                                Target Delegate Audience
                            </label>
                            <select
                                value={targetAudience}
                                onChange={e => setTargetAudience(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-900 text-xs font-bold"
                            >
                                <option value="Only MITS">Only MITS</option>
                                <option value="Open to All">Open to All Universities (Inter-College)</option>
                            </select>
                            <p className="text-[11px] font-medium text-slate-500">
                                Non-MITS events require institutional gate security coordination.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Submit Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-4">
                    <Link
                        href="/dashboard/events"
                        className="cartoon-btn bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-900 dark:text-white px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-black w-full sm:w-auto text-center"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="cartoon-btn bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 sm:px-8 sm:py-3 text-xs sm:text-sm font-black w-full sm:w-auto shadow-[3px_3px_0px_#0f172a] sm:shadow-[4px_4px_0px_#0f172a] disabled:opacity-50 flex items-center justify-center"
                    >
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                        {loading ? 'Routing to Approvers...' : 'Submit Event Proposal'}
                    </button>
                </div>

            </form>

        </div>
    );
}
