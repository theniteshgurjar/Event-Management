const prisma = require('../prisma');
const bcrypt = require('bcryptjs');

const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT',
            },
        });

        res.status(201).json({ message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                // Include assigned club info
                club: {
                    select: { id: true, name: true }
                },
                clubsManaged: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const userId = parseInt(id);

    try {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Prevent DSW from changing an Admin's role
        if (targetUser.role === 'ADMIN' && req.user?.role === 'DSW') {
            return res.status(403).json({ error: 'DSW is not authorized to change the role of an Admin.' });
        }

        // Prevent DSW from promoting someone to Admin
        if (role === 'ADMIN' && req.user?.role === 'DSW') {
            return res.status(403).json({ error: 'DSW is not authorized to assign the Admin role.' });
        }

        const updateData = { role };

        // If the new role is not CLUB_COORDINATOR, remove them from any club they coordinate
        if (role !== 'CLUB_COORDINATOR') {
            updateData.clubId = null;
        }

        // Perform the user update
        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // If the new role is not FACULTY or HOD (or other advisor roles), remove them from any club they advise
        const ADVISOR_ROLES = ['FACULTY', 'HOD', 'ADMIN', 'DSW'];
        if (!ADVISOR_ROLES.includes(role)) {
            await prisma.club.updateMany({
                where: { facultyAdvisorId: userId },
                data: { facultyAdvisorId: null }
            });
        }

        res.json({ message: 'User role updated', user });
    } catch (error) {
        console.error('Update Role Error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const userId = parseInt(id);

    try {
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (targetUser.role === 'ADMIN' && req.user?.role === 'DSW') {
            return res.status(403).json({ error: 'DSW is not authorized to delete an Admin.' });
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        // Handle constraint violations if any (though we really want to delete their data too)
        res.status(500).json({ error: 'Failed to delete user. They may have associated records.' });
    }
};

const assignClubToUser = async (req, res) => {
    const { id } = req.params; // User ID
    const { clubId } = req.body;

    try {
        const userId = parseInt(id);
        const cid = parseInt(clubId);

        // 1. Get User to check role
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!clubId) {
            // Optional: Handle unassignment logic if needed, or just return error
            return res.status(400).json({ error: 'Club ID is required' });
        }

        // 2. Perform Assignment based on Role
        // Allow FACULTY, HOD, DSW, ADMIN to be advisors? For now, FACULTY and HOD surely.
        const ADVISOR_ROLES = ['FACULTY', 'HOD', 'ADMIN', 'DSW'];

        if (ADVISOR_ROLES.includes(user.role)) {
            // Assign as Faculty Advisor (Overwrite existing)
            await prisma.club.update({
                where: { id: cid },
                data: { facultyAdvisorId: userId }
            });
        } else {
            // Assume STUDENT or CLUB_COORDINATOR
            // Assign as Coordinator (Connect)

            // First, make sure they have the COORDINATOR role if they are just a STUDENT?
            // The prompt says "Assign faculty coordinator and student coordinator".
            // It might be nice to auto-promote them to CLUB_COORDINATOR if they are a STUDENT.
            if (user.role === 'STUDENT') {
                await prisma.user.update({
                    where: { id: userId },
                    data: { role: 'CLUB_COORDINATOR' }
                });
            }

            await prisma.club.update({
                where: { id: cid },
                data: {
                    coordinators: {
                        connect: { id: userId }
                    }
                }
            });
        }

        res.json({ message: 'User assigned to club successfully' });

    } catch (error) {
        console.error('Assign Club Error:', error);
        res.status(500).json({ error: 'Failed to assign user to club' });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    updateUserRole,
    deleteUser,
    assignClubToUser
};
