const prisma = require('../prisma');

const createReport = async (req, res) => {
    const {
        eventId,
        overview,
        objective,
        eventDate,
        numberOfAttendees,
        numberOfParticipants,
        winners,
        photoLink,
        posterLink,
        attendanceSheetLink,
        certificateLink,
        totalExpenditure,
        expenditureComment
    } = req.body;

    try {
        const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
        if (!event) return res.status(404).json({ error: 'Event not found.' });

        if (event.status !== 'APPROVED') {
            return res.status(400).json({ error: 'Reports can only be submitted for APPROVED events.' });
        }

        const { role, userId } = req.user;

        if (role === 'DSW') {
            return res.status(403).json({ error: 'DSW reviews reports and cannot submit event reports.' });
        }

        if (role === 'CLUB_COORDINATOR') {
            // get user club
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user.clubId || user.clubId !== event.clubId) {
                return res.status(403).json({ error: 'You can only submit reports for your club events.' });
            }
        } else if (role === 'FACULTY') {
            // Check if Independent Coordinator OR Faculty Advisor of Club
            let isAuthorized = false;

            // 1. Independent?
            if (event.coordinatorId === userId) isAuthorized = true;

            // 2. Club Advisor?
            if (!isAuthorized && event.clubId) {
                const club = await prisma.club.findUnique({ where: { id: event.clubId } });
                if (club && club.facultyAdvisorId === userId) isAuthorized = true;
            }

            if (!isAuthorized) {
                return res.status(403).json({ error: 'You are not authorized to submit a report for this event.' });
            }
        }

        const report = await prisma.report.create({
            data: {
                eventId: parseInt(eventId),
                overview,
                objective,
                eventDate: eventDate ? new Date(eventDate) : undefined,
                numberOfAttendees: numberOfAttendees ? parseInt(numberOfAttendees) : 0,
                numberOfParticipants: numberOfParticipants ? parseInt(numberOfParticipants) : 0,
                // winners is now specific relation
                winners: {
                    create: Array.isArray(winners) ? winners.map(w => ({
                        category: w.category || null,
                        position: w.position ? parseInt(w.position) : 0, // Converting to Int as per schema
                        type: w.type || 'INDIVIDUAL',
                        name: w.name,
                        contact: w.contact
                    })) : []
                },
                photoLink,
                posterLink,
                attendanceSheetLink,
                certificateLink,
                totalExpenditure: totalExpenditure ? parseFloat(totalExpenditure) : 0,
                expenditureComment
            },
        });

        res.status(201).json({ message: 'Detailed report submitted successfully.', report });
    } catch (error) {
        console.error('Create Report Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getReports = async (req, res) => {
    const { role, userId } = req.user;

    try {
        let whereClause = {};

        if (role === 'FACULTY') {
            // Organizer's Advisor OR Independent Coordinator OR Collaborator's Advisor
            whereClause = {
                OR: [
                    { event: { club: { facultyAdvisorId: userId } } },
                    { event: { coordinatorId: userId } },
                    { event: { collaborators: { some: { facultyAdvisorId: userId } } } }
                ]
            };
        } else if (role === 'CLUB_COORDINATOR') {
            // Organizer OR Collaborator
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user && user.clubId) {
                whereClause = {
                    OR: [
                        { event: { clubId: user.clubId } },
                        { event: { collaborators: { some: { id: user.clubId } } } }
                    ]
                };
            } else {
                whereClause = { id: -1 };
            }
        } else if (role === 'HOD') {
            // Primary Department events
            const dept = await prisma.department.findUnique({ where: { hodId: userId } });
            if (dept) {
                whereClause = {
                    event: { departmentId: dept.id }
                };
            } else {
                whereClause = { id: -1 };
            }
        }
        // ADMIN / DSW get empty whereClause (all reports)

        const reports = await prisma.report.findMany({
            where: whereClause,
            include: {
                event: {
                    select: {
                        title: true,
                        startDateTime: true,
                        club: { select: { name: true } }
                    }
                }
            },
            orderBy: { submittedOn: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        console.error('Get Reports Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getReportById = async (req, res) => {
    const { id } = req.params;
    const { role, userId } = req.user;

    try {
        const report = await prisma.report.findUnique({
            where: { id: parseInt(id) },
            include: {
                winners: true, // Fetch generated winners
                event: {
                    select: {
                        id: true,
                        title: true,
                        startDateTime: true,
                        endDateTime: true,
                        clubId: true,
                        coordinatorId: true,
                        club: { select: { name: true, facultyAdvisorId: true } },
                        collaborators: { select: { id: true, facultyAdvisorId: true } },
                        // New Fields
                        mainCategory: true,
                        subCategory: true,
                        externalGuests: true,
                        internalGuests: true,
                        schedules: {
                            include: {
                                venue: { select: { name: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!report) return res.status(404).json({ error: 'Report not found.' });

        // Permission Check
        if (role === 'CLUB_COORDINATOR') {
            const user = await prisma.user.findUnique({ where: { id: userId } });

            const isOrganizer = user.clubId && user.clubId === report.event.clubId;
            const isCollaborator = user.clubId && report.event.collaborators.some(c => c.id === user.clubId);

            if (!isOrganizer && !isCollaborator) {
                return res.status(403).json({ error: 'Access denied.' });
            }
        } else if (role === 'FACULTY') {
            const isAdvisor = report.event.club?.facultyAdvisorId === userId;
            const isCoordinator = report.event.coordinatorId === userId; // Independent
            const isCollaboratingAdvisor = report.event.collaborators?.some(c => c.facultyAdvisorId === userId);

            if (!isAdvisor && !isCoordinator && !isCollaboratingAdvisor) {
                return res.status(403).json({ error: 'Access denied.' });
            }
            // Allow
        } else if (role === 'HOD') {
            const department = await prisma.department.findUnique({ where: { hodId: userId } });
            if (!department || report.event.departmentId !== department.id) {
                return res.status(403).json({ error: 'Access denied. You can only view reports for your department.' });
            }
        }
        // ADMIN/DSW allow

        res.json(report);
    } catch (error) {
        console.error('Get Report Details Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    createReport,
    getReports,
    getReportById
};
