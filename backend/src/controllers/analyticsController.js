const prisma = require('../prisma');

// Helper to calculate total from array
const sum = (arr, key) => arr.reduce((acc, curr) => acc + (curr[key] || 0), 0);

// Helper for filters (Date + Club)
const getCommonFilters = async (req) => {
    const { startDate, endDate, clubId } = req.query;
    let filters = { AND: [] }; // Use AND array for flexibility

    // Date Logic
    if (startDate || endDate) {
        filters.AND.push({
            startDateTime: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
            }
        });
    }

    // Role-Based Filtering
    if (req.user) {
        if (req.user.role === 'CLUB_COORDINATOR') {
            const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
            if (user && user.clubId) {
                // Include Organizing OR Collaborating
                filters.AND.push({
                    OR: [
                        { clubId: user.clubId },
                        { collaborators: { some: { id: user.clubId } } }
                    ]
                });
            }
        } else if (req.user.role === 'FACULTY') {
            const advisedClubs = await prisma.club.findMany({
                where: { facultyAdvisorId: req.user.userId },
                select: { id: true }
            });
            const advisedClubIds = advisedClubs.map(c => c.id);
            if (advisedClubIds.length > 0) {
                filters.AND.push({
                    OR: [
                        { clubId: { in: advisedClubIds } },
                        { collaborators: { some: { id: { in: advisedClubIds } } } }
                    ]
                });
            }
        }
    }

    // Explicit Club Filter (Only if not overridden by role)
    if (clubId) {
        filters.AND.push({
            OR: [
                { clubId: parseInt(clubId) },
                { collaborators: { some: { id: parseInt(clubId) } } }
            ]
        });
    }

    if (filters.AND.length === 0) return {};
    return filters;
};

const getOverallStats = async (req, res) => {
    try {
        const filters = await getCommonFilters(req);

        // 1. Event Counts
        const events = await prisma.event.findMany({
            where: filters,
            select: { status: true, id: true }
        });

        const totalEvents = events.length;
        const approvedEvents = events.filter(e => e.status === 'APPROVED' || e.status === 'COMPLETED').length;
        const completedEvents = events.filter(e => e.status === 'COMPLETED').length;

        // Custom Pending Count based on Role
        let pendingEvents = 0;
        let hodDepartmentName = null;

        if (req.user && req.user.role === 'HOD') {
            const userId = parseInt(req.user.userId);
            // Check specifically for events needing HOD approval for their department
            const department = await prisma.department.findFirst({ where: { hodId: userId } });

            if (department) {
                hodDepartmentName = department.name;
                // We need to re-query or filter differently because 'events' above uses common filters which might not capture "Department Context" fully if common filters only look at Club/Advisor roles.
                // Actually getCommonFilters currently doesn't handle HOD.
                // Let's doing a specific count for HOD pending items.
                pendingEvents = await prisma.event.count({
                    where: {
                        departmentId: department.id,
                        status: 'PENDING_HOD_APPROVAL'
                    }
                });
            }
        } else if (req.user && req.user.role === 'DSW') {
            pendingEvents = events.filter(e => e.status === 'PENDING_DSW_APPROVAL').length;
        } else {
            // General Pending (Admin see all pending?)
            pendingEvents = events.filter(e => e.status ? e.status.startsWith('PENDING') : false).length;
        }

        // 2. Financials & Participation (From Reports)
        const reports = await prisma.report.findMany({
            where: {
                event: filters
            },
            select: {
                totalExpenditure: true,
                numberOfAttendees: true,
                numberOfParticipants: true
            }
        });

        const totalBudgetUtilized = sum(reports, 'totalExpenditure');
        const totalAttendees = sum(reports, 'numberOfAttendees');
        const totalParticipants = sum(reports, 'numberOfParticipants');

        // 3. Active Clubs Count
        // If filtering by specific club (via role/query), we just check that club(s).
        // Simplification: If Role is Coord/Faculty, count of "Active Clubs" is usually just "Does my club exist?" or 1.
        // If Admin, count all.
        let clubsCount = 0;

        let clubFilter = { status: 'ACTIVE' };
        // Check req.user exists before accessing role
        if (req.user && req.user.role === 'CLUB_COORDINATOR' && req.user.clubId) {
            clubFilter.id = req.user.clubId;
        }
        // For Faculty, could be multiple

        // However, the card "Active Clubs" is mainly for Admin.
        clubsCount = await prisma.club.count({ where: clubFilter });

        const reportsCount = reports.length;

        res.json({
            events: {
                total: totalEvents,
                approved: approvedEvents,
                pending: pendingEvents,
                completed: completedEvents
            },
            financials: {
                totalUtilized: totalBudgetUtilized,
                reportsSubmitted: reportsCount
            },
            participation: {
                attendees: totalAttendees,
                participants: totalParticipants
            },
            clubs: {
                active: clubsCount
            },
            meta: {
                // Diagnostic info
                departmentName: (req.user && req.user.role === 'HOD')
                    ? (hodDepartmentName || 'Unassigned')
                    : null
            }
        });

    } catch (error) {
        console.error('Analytics Overall Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getClubStats = async (req, res) => {
    try {
        const { startDate, endDate, clubId } = req.query;

        // Filter the CLUBS list
        const clubWhere = { status: 'ACTIVE' };
        if (clubId) {
            clubWhere.id = parseInt(clubId);
        }

        // Filter the EVENTS inside the club (Date range only, clubId is implied by parent)
        const eventWhere = {};
        if (startDate || endDate) {
            eventWhere.startDateTime = {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
            };
        }

        const clubs = await prisma.club.findMany({
            where: clubWhere,
            select: {
                id: true,
                name: true,
                events: {
                    where: eventWhere,
                    select: {
                        status: true,
                        report: {
                            select: { totalExpenditure: true }
                        }
                    }
                }
            }
        });

        const stats = clubs.map(club => {
            const approvedEvents = club.events.filter(e => ['APPROVED', 'COMPLETED'].includes(e.status));
            const expenditure = club.events.reduce((acc, event) => {
                return acc + (event.report?.totalExpenditure || 0);
            }, 0);

            return {
                id: club.id,
                name: club.name,
                eventsCount: approvedEvents.length,
                totalExpenditure: expenditure
            };
        });

        // Top 5 Spenders or Most Active could be sorted on frontend
        // Top 5 Spenders or Most Active could be sorted on frontend
        // Top 5 Spenders
        stats.sort((a, b) => b.totalExpenditure - a.totalExpenditure);
        res.json(stats);

    } catch (error) {
        console.error('Analytics Club Stats Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getTrendStats = async (req, res) => {
    try {
        const filters = await getCommonFilters(req);

        const reports = await prisma.report.findMany({
            where: {
                event: filters
            },
            include: {
                event: { select: { startDateTime: true } }
            },
            orderBy: { event: { startDateTime: 'asc' } }
        });

        const monthlyData = {};

        reports.forEach(report => {
            const date = new Date(report.event.startDateTime);
            const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`; // e.g., "Jan 2025"

            if (!monthlyData[key]) {
                monthlyData[key] = { name: key, attendees: 0, expenditure: 0, events: 0, sortDate: date };
            }

            monthlyData[key].attendees += (report.numberOfAttendees || 0);
            monthlyData[key].expenditure += (report.totalExpenditure || 0);
            monthlyData[key].events += 1;
        });
        const trends = Object.values(monthlyData).sort((a, b) => a.sortDate - b.sortDate);

        res.json(trends);
    } catch (error) {
        console.error('Analytics Trends Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getVenueStats = async (req, res) => {
    // Role Check: Allow ADMIN, DSW, CLUB_COORDINATOR, FACULTY
    if (!['ADMIN', 'DSW', 'CLUB_COORDINATOR', 'FACULTY'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied.' });
    }
    try {
        const filters = await getCommonFilters(req);

        // Count Bookings per venue
        // Use EventSchedule to link Venue -> Event, applying Event filters
        const schedules = await prisma.eventSchedule.findMany({
            where: {
                event: {
                    ...filters,
                    status: { in: ['APPROVED', 'COMPLETED'] }
                }
            },
            include: {
                venue: { select: { name: true, capacity: true } }
            }
        });

        // Aggregation
        const venueMap = {};
        schedules.forEach(sch => {
            const vName = sch.venue.name;
            if (!venueMap[vName]) {
                venueMap[vName] = { name: vName, count: 0, capacity: sch.venue.capacity };
            }
            venueMap[vName].count++;
        });

        const stats = Object.values(venueMap).sort((a, b) => b.count - a.count);

        res.json(stats);
    } catch (error) {
        console.error('Analytics Venue Stats Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getCategoryStats = async (req, res) => {
    try {
        const filters = await getCommonFilters(req);

        const events = await prisma.event.findMany({
            where: {
                ...filters,
                status: { in: ['APPROVED', 'COMPLETED'] }
            },
            select: { categories: true }
        });

        const catMap = {};
        events.forEach(e => {
            if (e.categories && Array.isArray(e.categories)) {
                e.categories.forEach(cat => {
                    catMap[cat] = (catMap[cat] || 0) + 1;
                });
            } else {
                catMap['Uncategorized'] = (catMap['Uncategorized'] || 0) + 1;
            }
        });

        const stats = Object.keys(catMap).map(key => ({
            name: key.replace('_', ' '),
            value: catMap[key]
        }));

        res.json(stats);
    } catch (error) {
        console.error('Category Stats Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getOverallStats,
    getClubStats,
    getTrendStats,
    getVenueStats,
    getCategoryStats
};
