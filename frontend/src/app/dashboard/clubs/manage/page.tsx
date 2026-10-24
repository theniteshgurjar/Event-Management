'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config/api';

export default function ManageClubPage() {
    const { user, token } = useAuth();
    const router = useRouter();

    const [club, setClub] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form Fields
    const [logoUrl, setLogoUrl] = useState('');
    const [president, setPresident] = useState('');
    const [treasurer, setTreasurer] = useState('');
    const [vicePresidents, setVicePresidents] = useState<string[]>(['']);
    const [secretaries, setSecretaries] = useState<string[]>(['']);

    useEffect(() => {
        if (!user) return;
        // Fetch the club managed by this user
        // We know user.clubId should exist if they are a coordinator (based on our previous logic)
        // But the user object in context might not be updated yet if we just assigned them. 
        // Ideally we fetch "my club". For now let's assume we can fetch user's club.
        // Actually, we need an API endpoint "GET /api/clubs/my-club" or similar, or filter client side.
        // Let's rely on finding standard club fetch.

        const fetchMyClub = async () => {
            try {
                // Fetch all clubs and filter (inefficient but works for now)
                // Or better: Fetch user profile to get clubId
                const res = await fetch(`${API_URL}/api/clubs`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const clubs = await res.json();
                    // Just pick the first one they coordinate for now, or find by ID
                    // Since we didn't add an endpoint for "My Club", let's assume we pass ID in URL or find it here.
                    // Let's try to find a club where check logic matches.
                    // Actually, the user object in AuthContext usually has role/id.
                    // Let's fetch the specific club if we knew the ID. 
                    // Let's assume the user knows their club or we find it.
                    // FIX: We need robust way to get "My Club".
                    // Let's fallback to: "User select club if Admin, or auto-select if Coordinator"
                    // But for this specific page, let's assume we fetch `api/clubs` and find where `coordinators` includes me.

                    // Note: `getAllClubs` currently doesn't return coordinators array by default (only advisor).
                    // We might need to update getAllClubs or just rely on manual input for now?
                    // No, let's fetch individual club if possible.

                    // WORKAROUND: For now, I'll fetch ALL clubs, iterate and detail fetch to find myself? Too slow.
                    // Let's just fetch club 1 for demo or assume user object has `clubId` (which we added to schema but maybe not to JWT).

                    // Let's just hardcode finding the club where I am coordinator.
                    // Since I don't have "My Club" API, I will implement a quick fetch logic here.
                    // Wait, I can update `dashboard/page.tsx` to pass the ID.
                    // For this page, let's assume it's `/dashboard/clubs/manage`. I'll try to find the club.

                    // TEMP FIX: Fetch all, check if I am in coordinators list (if exposed).
                    // If not exposed, I can't know. 

                    // Better approach: User goes to `/dashboard/clubs/[id]/manage`. 
                    // Let's do that. Move this file to `[id]/manage`.
                }
            } catch (e) { console.error(e); }
        };
        // fetchMyClub();
    }, [user, token]);

    // Changing approach: Use dynamic route [id]/manage in next step.
    return <div>Redirecting...</div>
}
