const prisma = require('../prisma');

const createClub = async (req, res) => {
    const { name, description, facultyAdvisorId, coordinatorId } = req.body;

    try {
        const existingClub = await prisma.club.findUnique({
            where: { name },
        });

        if (existingClub) {
            return res.status(400).json({ error: 'Club with this name already exists.' });
        }

        const club = await prisma.club.create({
            data: {
                name,
                description,
                facultyAdvisorId: facultyAdvisorId ? parseInt(facultyAdvisorId) : null,
                status: 'ACTIVE',
                // If a coordinator is provided, connect them to this club's team
                coordinators: coordinatorId ? {
                    connect: { id: parseInt(coordinatorId) }
                } : undefined
            },
        });

        res.status(201).json({ message: 'Club created successfully', club });
    } catch (error) {
        console.error('Create Club Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getAllClubs = async (req, res) => {
    try {
        const clubs = await prisma.club.findMany({
            include: {
                facultyAdvisor: {
                    select: { name: true, email: true },
                },
                coordinators: {
                    select: { id: true },
                },
            },
        });
        res.json(clubs);
    } catch (error) {
        console.error('Get All Clubs Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getClubById = async (req, res) => {
    const { id } = req.params;

    try {
        const club = await prisma.club.findUnique({
            where: { id: parseInt(id) },
            include: {
                events: {
                    include: {
                        report: { select: { id: true } }
                    }
                },
                collaborations: {
                    include: {
                        report: { select: { id: true } }
                    }
                },
                facultyAdvisor: {
                    select: { name: true, email: true },
                },
                coordinators: {
                    select: { id: true, name: true, email: true },
                }
            },
        });

        if (!club) {
            return res.status(404).json({ error: 'Club not found.' });
        }

        // Merge organized events and collaborations
        let allEvents = [...club.events, ...club.collaborations];

        const user = req.user;
        if (!user || user.role === 'STUDENT') {
            allEvents = allEvents.filter(e => ['APPROVED', 'COMPLETED', 'CANCELLED'].includes(e.status));
        }

        allEvents.sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));

        club.events = allEvents;
        delete club.collaborations; // Clean up

        res.json(club);
    } catch (error) {
        console.error('Get Club Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getMyClub = async (req, res) => {
    const userId = req.user.userId;
    const role = req.user.role;

    try {
        let club = await prisma.club.findFirst({
            where: {
                OR: [
                    { facultyAdvisorId: userId },
                    { coordinators: { some: { id: userId } } }
                ]
            }
        });

        if (!club) {
            return res.status(404).json({ error: 'No club associated with your account.' });
        }

        res.json(club);
    } catch (error) {
        console.error('Get My Club Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};



const updateClub = async (req, res) => {
    const { id } = req.params;
    const {
        name, description, status, facultyAdvisorId, coordinatorId,
        logoUrl, president, treasurer, vicePresidents, secretaries,
        presidentEnrollment, treasurerEnrollment, vicePresidentsEnrollment, secretariesEnrollment,
        contactEmail, contactPhone
    } = req.body;

    const userRole = req.user.role; // From authMiddleware
    const userId = req.user.userId;

    try {
        // Validation for VPs and Secretaries (if provided)
        if (vicePresidents && (vicePresidents.length < 1 || vicePresidents.length > 2)) {
            return res.status(400).json({ error: 'There must be between 1 and 2 Vice Presidents.' });
        }
        if (secretaries && (secretaries.length < 1 || secretaries.length > 2)) {
            return res.status(400).json({ error: 'There must be between 1 and 2 Secretaries.' });
        }
        // Validation for parallel arrays could be added here to ensure lengths match

        // Check if club exists
        const existingClub = await prisma.club.findUnique({ where: { id: parseInt(id) } });
        if (!existingClub) {
            return res.status(404).json({ error: 'Club not found.' });
        }

        // PERMISSION CHECK
        if (userRole === 'CLUB_COORDINATOR') {
            // 1. Must be coordinator of THIS club
            // Note: We check the DB user record for truth source, or trust the token. 
            // Better to verify connection in DB if critical.
            // Assuming authMiddleware populates req.user correctly, we can basic check:
            // But let's check strict "Is this user a coordinator of this club?"
            const isCoordinator = await prisma.club.findFirst({
                where: {
                    id: parseInt(id),
                    coordinators: {
                        some: { id: userId }
                    }
                }
            });

            if (!isCoordinator) {
                return res.status(403).json({ error: 'You are not authorized to manage this club.' });
            }

            // 2. RESTRICTED FIELDS
            if (facultyAdvisorId || coordinatorId || status || name) {
                return res.status(403).json({
                    error: 'Coordinators cannot change Name, Status, Faculty Advisor, or Assign Coordinators.'
                });
            }
        }

        if (userRole === 'FACULTY') {
            const club = await prisma.club.findUnique({ where: { id: parseInt(id) } });
            if (!club || club.facultyAdvisorId !== userId) {
                return res.status(403).json({ error: 'You are not the Faculty Advisor for this club.' });
            }
            // RESTRICTED FIELDS
            if (facultyAdvisorId || coordinatorId || status || name) {
                return res.status(403).json({
                    error: 'Faculty Advisors cannot change Club Name, Status, or assign new Advisors/Coordinators via this edit.'
                });
            }
        }

        const dataToUpdate = {
            description: description || undefined,
            // Club Details
            logoUrl: logoUrl || undefined,
            president: president || undefined,
            treasurer: treasurer || undefined,
            vicePresidents: vicePresidents || undefined,
            secretaries: secretaries || undefined,

            // New Fields
            presidentEnrollment: presidentEnrollment || undefined,
            treasurerEnrollment: treasurerEnrollment || undefined,
            vicePresidentsEnrollment: vicePresidentsEnrollment || undefined,
            secretariesEnrollment: secretariesEnrollment || undefined,
            contactEmail: contactEmail || undefined,
            contactPhone: contactPhone || undefined,
        };

        // ADMIN / DSW Privileged Fields
        if (userRole === 'ADMIN' || userRole === 'DSW') {
            dataToUpdate.name = name || undefined;
            dataToUpdate.status = status || undefined;
            dataToUpdate.facultyAdvisorId = facultyAdvisorId ? parseInt(facultyAdvisorId) : undefined;

            // Support setting the full list of coordinators
            if (req.body.coordinatorIds && Array.isArray(req.body.coordinatorIds)) {
                if (req.body.coordinatorIds.length > 2) {
                    return res.status(400).json({ error: "Maximum 2 Club Coordinators allowed." });
                }
                dataToUpdate.coordinators = {
                    set: req.body.coordinatorIds.map(id => ({ id: parseInt(id) }))
                };
            }
            // Legacy single add support
            else if (coordinatorId) {
                dataToUpdate.coordinators = {
                    connect: { id: parseInt(coordinatorId) }
                };
            }
        }

        const updatedClub = await prisma.club.update({
            where: { id: parseInt(id) },
            data: dataToUpdate,
        });

        res.json({ message: 'Club updated successfully', club: updatedClub });
    } catch (error) {
        console.error('Update Club Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const deleteClub = async (req, res) => {
    const { id } = req.params;

    try {
        // Cascade delete logic (if not handled by DB constraints)
        // 1. Delete all events associated with the club
        await prisma.event.deleteMany({ where: { clubId: parseInt(id) } });

        // 2. Disconnect coordinators/advisors ? 
        // Prisma 'Club' deletion will handle the relation disconnects, but users remain.
        // We delete the club itself.
        await prisma.club.delete({
            where: { id: parseInt(id) }
        });


        res.json({ message: 'Club deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Club not found.' });
        }
        console.error('Delete Club Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    createClub,
    getAllClubs,
    getClubById,
    updateClub,
    deleteClub,
    getMyClub
};
