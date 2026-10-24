const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const venues = [
    { "name": "Colloquium", "capacity": 500, "facilities": "Projector, Sound System, Video Conferencing" },
    { "name": "Conclave Center", "capacity": 150, "facilities": "Projector, Sound System, AC, Conference Setup" },
    { "name": "Student Activity Center", "capacity": 250, "facilities": "Multipurpose Hall, Stage" },
    { "name": "Open Ground", "capacity": 5000, "facilities": "Open space, Outdoor" },
    { "name": "SH1", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH2", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH3", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH4", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH5", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH6", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH7", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH8", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH9", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH10", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH11", "capacity": 60, "facilities": "Projector, Whiteboard" },
    { "name": "SH12", "capacity": 60, "facilities": "Projector, Whiteboard" }
];


    console.log('Seeding Venues...');

    // Hard Reset: Clear all event-related data to free up venues
    try {
        console.log('Performing Hard Reset (Deleting Events, Reports, Approvals)...');
        // Delete in order of dependency
        await prisma.file.deleteMany({});
        await prisma.report.deleteMany({});
        await prisma.approval.deleteMany({});
        await prisma.event.deleteMany({});
        await prisma.club.deleteMany({}); // Delete Clubs
        await prisma.eventSchedule.deleteMany({}); // Delete Schedules to free venues
        await prisma.venue.deleteMany({});
        await prisma.department.deleteMany({}); // Delete Departments
        console.log('Previous data cleared successfully.');
    } catch (error) {
        console.error('Error clearing database:', error);
    }

    for (const v of venues) {
        const venue = await prisma.venue.upsert({
            where: { name: v.name },
            update: {},
            create: v,
        });
        console.log(`Created venue: ${venue.name}`);
    }

    // Seed Departments
    const departments = [
    { "code": "CE", "name": "Civil Engineering" },
    { "code": "ME", "name": "Mechanical Engineering" },
    { "code": "EE", "name": "Electrical Engineering" },
    { "code": "EC", "name": "Electronics Engineering" },
    { "code": "CSE", "name": "Computer Science & Engineering" },
    { "code": "IT", "name": "Information Technology" },
    { "code": "AI", "name": "Centre for Artificial Intelligence" },
    { "code": "IoT", "name": "Centre for Internet of Things" },
    { "code": "EMC", "name": "Engineering Mathematics & Computing" },
    { "code": "CST", "name": "Centre for Computer Science and Technology" },
    { "code": "CHE", "name": "Chemical Engineering" },
    { "code": "ARCH", "name": "Architecture & Planning" },
    { "code": "AS", "name": "Applied Science" },
    { "code": "HM", "name": "Humanities and Management" },
    { "code": "ET", "name": "Electronics and Telecommunications Engineering" }
];
    console.log('Seeding Departments...');
    for (const dept of departments) {
        await prisma.department.upsert({
            where: { code: dept.code },
            update: {},
            create: dept
        });
        console.log(`Created department: ${dept.code} - ${dept.name}`);
    }

    // Seed Admin User
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        throw new Error('ADMIN_PASSWORD is not set in environment variables');
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@dsw.com' },
        update: { password: hashedPassword },
        create: {
            name: 'Admin User',
            email: 'admin@dsw.com',
            password: hashedPassword,
            role: 'ADMIN'
        },
    });
    console.log(`Created Admin User: ${adminUser.email} / [HIDDEN]`);

    // Seed Clubs
    const clubs = [
        { name: "Fitness Club", description: "Promotes physical fitness, wellness, and healthy lifestyles." },
        { name: "Heritage & Tourism Club", description: "Promotes cultural heritage, history, and tourism awareness." },
        { name: "Hindi Samiti", description: "Encourages Hindi language, literature, and cultural activities." }
    ];

    console.log('Seeding Clubs...');
    for (const club of clubs) {
        await prisma.club.upsert({
            where: { name: club.name },
            update: {},
            create: {
                name: club.name,
                description: club.description,
                status: 'ACTIVE'
            }
        });
        console.log(`Created club: ${club.name}`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
