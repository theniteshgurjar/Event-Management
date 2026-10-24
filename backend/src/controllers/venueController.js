const prisma = require('../prisma');

const getAllVenues = async (req, res) => {
    try {
        const venues = await prisma.venue.findMany({
            include: { department: { select: { name: true, id: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(venues);
    } catch (error) {
        console.error('Get Venues Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const createVenue = async (req, res) => {
    const { name, capacity, facilities, departmentId, isDepartmentRestricted } = req.body;

    if (!name || !capacity) {
        return res.status(400).json({ error: 'Name and Capacity are required.' });
    }

    try {
        const existingVenue = await prisma.venue.findUnique({
            where: { name }
        });

        if (existingVenue) {
            return res.status(400).json({ error: 'Venue with this name already exists.' });
        }

        const venue = await prisma.venue.create({
            data: {
                name,
                name,
                capacity: parseInt(capacity),
                facilities,
                departmentId: departmentId ? parseInt(departmentId) : null,
                isDepartmentRestricted: !!isDepartmentRestricted
            }
        });

        res.status(201).json(venue);
    } catch (error) {
        console.error('Create Venue Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const updateVenue = async (req, res) => {
    const { id } = req.params;
    const { name, capacity, facilities, departmentId, isDepartmentRestricted } = req.body;

    try {
        const venue = await prisma.venue.update({
            where: { id: parseInt(id) },
            data: {
                name,
                capacity: capacity ? parseInt(capacity) : undefined,
                name,
                capacity: capacity ? parseInt(capacity) : undefined,
                facilities,
                departmentId: departmentId ? parseInt(departmentId) : undefined,
                isDepartmentRestricted: isDepartmentRestricted !== undefined ? !!isDepartmentRestricted : undefined
            }
        });
        res.json(venue);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Venue not found.' });
        }
        console.error('Update Venue Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const deleteVenue = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.venue.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Venue deleted successfully.' });
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ error: 'Cannot delete venue because it is associated with existing events.' });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Venue not found.' });
        }
        console.error('Delete Venue Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getVenueBookings = async (req, res) => {
    try {
        const schedules = await prisma.eventSchedule.findMany({
            where: {
                event: {
                    status: { notIn: ['REJECTED', 'CANCELLED'] }
                }
            },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        club: { select: { name: true } }
                    }
                },
                venue: { select: { name: true } }
            },
            orderBy: { startTime: 'asc' }
        });

        // Transform to simplified Booking interface
        const bookings = schedules.map(sch => ({
            id: sch.id,
            eventName: sch.event?.title || 'Unknown Event',
            clubName: sch.event?.club?.name || 'Independent',
            venueName: sch.venue?.name || 'Unknown Venue',
            startDateTime: sch.startTime,
            endDateTime: sch.endTime,
            status: sch.event?.status || 'PENDING'
        }));

        res.json(bookings);
    } catch (error) {
        console.error('Get Bookings Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    getAllVenues,
    createVenue,
    updateVenue,
    deleteVenue,
    getVenueBookings
};
