const prisma = require('../prisma');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const notifications = [];

        // ADMIN / DSW Logic
        if (userRole === 'ADMIN' || userRole === 'DSW') {

            // 1. Pending Approvals
            const pendingCount = await prisma.event.count({
                where: { status: 'PENDING' }
            });

            if (pendingCount > 0) {
                notifications.push({
                    id: `pending_approvals_${pendingCount}`,
                    title: 'Pending Approvals',
                    desc: `You have ${pendingCount} events waiting for approval.`,
                    time: 'Action Required',
                    color: 'bg-amber-500',
                    link: '/dashboard/approvals'
                });
            }

            // 2. Reports Submitted
            const reportsCount = await prisma.report.count();
            if (reportsCount > 0) {
                notifications.push({
                    id: `reports_submitted_${reportsCount}`,
                    title: 'Reports Submitted',
                    desc: `${reportsCount} event reports have been submitted.`,
                    time: 'Recently',
                    color: 'bg-blue-500',
                    link: '/dashboard/reports'
                });
            }
        }

        // CLUB_COORDINATOR / FACULTY Logic
        if (userRole === 'CLUB_COORDINATOR' || userRole === 'FACULTY') {
            let whereClause = {};

            if (userRole === 'CLUB_COORDINATOR') {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user && user.clubId) {
                    whereClause = { clubId: user.clubId };
                }
            } else if (userRole === 'FACULTY') {
                const advisedClubs = await prisma.club.findMany({
                    where: { facultyAdvisorId: userId },
                    select: { id: true }
                });
                const advisedClubIds = advisedClubs.map(c => c.id);

                whereClause = {
                    OR: [
                        { clubId: { in: advisedClubIds } },
                        { coordinatorId: userId }
                    ]
                };
            }

            // Proceed if we have a valid filter
            if (Object.keys(whereClause).length > 0 || (userRole === 'FACULTY')) {

                // 1. Status Updates (Upcoming Events that are Approved/Rejected)
                const statusEvents = await prisma.event.findMany({
                    where: {
                        ...whereClause,
                        status: { in: ['APPROVED', 'REJECTED'] },
                        startDateTime: { gte: new Date() } // Only future events
                    },
                    orderBy: { updatedAt: 'desc' }
                });

                statusEvents.forEach(event => {
                    if (event.status === 'APPROVED') {
                        notifications.push({
                            id: `event_approved_${event.id}`,
                            title: 'Event Approved',
                            desc: `"${event.title}" has been approved.`,
                            time: new Date(event.updatedAt).toLocaleDateString(),
                            color: 'bg-green-500',
                            link: `/dashboard/events/${event.id}`
                        });
                    } else if (event.status === 'REJECTED') {
                        notifications.push({
                            id: `event_rejected_${event.id}`,
                            title: 'Event Rejected',
                            desc: `"${event.title}" was rejected. ${event.rejectionReason ? `Reason: ${event.rejectionReason}` : ''}`,
                            time: new Date(event.updatedAt).toLocaleDateString(),
                            color: 'bg-red-500',
                            link: `/dashboard/events/${event.id}`
                        });
                    }
                });

                // 2. Report Submission Requests (Past events, Approved, No Report)
                const reportDueEvents = await prisma.event.findMany({
                    where: {
                        ...whereClause,
                        status: 'APPROVED',
                        endDateTime: { lt: new Date() },
                        report: null
                    },
                    // We need to ensure report is null. 
                    // Prisma's `report: null` in where clause works for 1-1 relations usually? 
                    // Or we filter manually. `report: { is: null }`?
                    // Let's try simple include and filter manually to be safe if schema is complex.
                    include: { report: true }
                });

                reportDueEvents.forEach(event => {
                    if (!event.report) {
                        notifications.push({
                            id: `report_due_${event.id}`,
                            title: 'Report Submission Due',
                            desc: `Please submit the post-event report for "${event.title}".`,
                            time: 'Action Required',
                            color: 'bg-purple-500',
                            link: `/dashboard/reports/create?eventId=${event.id}` // Assuming this logic
                        });
                    }
                });
            }
        }

        res.json(notifications);

    } catch (error) {
        console.error('Get Notifications Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getNotifications };
