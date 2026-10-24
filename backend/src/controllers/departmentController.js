const prisma = require('../prisma');

const createDepartment = async (req, res) => {
    const { name, code, hodId } = req.body;

    // Validate Input
    if (!name || !code) {
        return res.status(400).json({ error: 'Name and Code are required.' });
    }

    try {
        // Check if unique
        const existing = await prisma.department.findFirst({
            where: {
                OR: [{ name }, { code }]
            }
        });
        if (existing) return res.status(400).json({ error: 'Department name or code already exists.' });

        // Check and Update HOD user
        if (hodId) {
            const user = await prisma.user.findUnique({ where: { id: parseInt(hodId) } });
            if (!user) return res.status(400).json({ error: 'HOD User not found.' });

            // Auto-promote to HOD if not Admin
            if (user.role !== 'HOD' && user.role !== 'ADMIN') {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: 'HOD' }
                });
            }
        }

        const department = await prisma.department.create({
            data: {
                name,
                code,
                hodId: hodId ? parseInt(hodId) : null
            }
        });

        res.status(201).json({ message: 'Department created successfully.', department });

    } catch (error) {
        console.error('Create Department Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getAllDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            include: {
                hod: { select: { id: true, name: true, email: true } },
                venues: { select: { id: true, name: true, capacity: true } },
                clubs: { select: { id: true, name: true } },
                _count: {
                    select: { venues: true, clubs: true, events: true, members: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(departments);
    } catch (error) {
        console.error('Get Departments Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const getDepartmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const department = await prisma.department.findUnique({
            where: { id: parseInt(id) },
            include: {
                hod: { select: { id: true, name: true, email: true } },
                venues: true,
                clubs: true,
                events: {
                    where: { status: { in: ['APPROVED', 'COMPLETED'] } },
                    include: { report: true }
                }
            }
        });
        if (!department) return res.status(404).json({ error: 'Department not found.' });
        res.json(department);
    } catch (error) {
        console.error('Get Department Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { name, code, hodId } = req.body;

    try {
        const data = {};
        if (name) data.name = name;
        if (code) data.code = code;

        if (hodId !== undefined) {
            // If changing HOD
            const newHodId = parseInt(hodId);

            // 1. Demote old HOD if needed (Optional: Logic can be complex if they are HOD of multiple)
            // For simplicity, we just promote the new one.
            if (newHodId) {
                const user = await prisma.user.findUnique({ where: { id: newHodId } });
                if (user && user.role !== 'HOD' && user.role !== 'ADMIN') {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { role: 'HOD' }
                    });
                }
            }

            data.hodId = newHodId || null;
        }

        const department = await prisma.department.update({
            where: { id: parseInt(id) },
            data
        });
        res.json({ message: 'Department updated successfully.', department });
    } catch (error) {
        console.error('Update Department Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.department.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Department deleted successfully.' });
    } catch (error) {
        console.error('Delete Department Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};
