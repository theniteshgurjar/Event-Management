const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedUsers() {
    console.log('Seeding default system users...');

    const adminPassword = process.env.ADMIN_PASSWORD;
    const defaultPassword = 'admin123';

    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);

    // Find CSE department if exists
    const cseDept = await prisma.department.findFirst({ where: { code: 'CSE' } });
    
    // Find Hindi Samiti club if exists
    const hindiClub = await prisma.club.findFirst({ where: { name: 'Hindi Samiti' } });

    // 1. Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@dsw.com' },
        update: { password: hashedAdminPassword, role: 'ADMIN' },
        create: {
            name: 'Admin User',
            email: 'admin@dsw.com',
            password: hashedAdminPassword,
            role: 'ADMIN'
        }
    });
    console.log('Created Admin:', admin.email);

    // 2. DSW
    const dsw = await prisma.user.upsert({
        where: { email: 'dsw@dsw.com' },
        update: { password: hashedDefaultPassword, role: 'DSW' },
        create: {
            name: 'Dean Student Welfare',
            email: 'dsw@dsw.com',
            password: hashedDefaultPassword,
            role: 'DSW'
        }
    });
    console.log('Created DSW:', dsw.email);

    // 3. Faculty 1 & 2
    const faculty1 = await prisma.user.upsert({
        where: { email: 'faculty@dsw.com' },
        update: { password: hashedDefaultPassword, role: 'FACULTY' },
        create: {
            name: 'Dr. Faculty Advisor',
            email: 'faculty@dsw.com',
            password: hashedDefaultPassword,
            role: 'FACULTY',
            departmentId: cseDept ? cseDept.id : undefined
        }
    });

    const faculty2 = await prisma.user.upsert({
        where: { email: 'faculty2@dsw.com' },
        update: { password: hashedDefaultPassword, role: 'FACULTY' },
        create: {
            name: 'Prof. Faculty Two',
            email: 'faculty2@dsw.com',
            password: hashedDefaultPassword,
            role: 'FACULTY',
            departmentId: cseDept ? cseDept.id : undefined
        }
    });
    console.log('Created Faculty:', faculty1.email, faculty2.email);

    // 4. HOD
    const hod = await prisma.user.upsert({
        where: { email: 'hodcse@dsw.com' },
        update: { password: hashedDefaultPassword, role: 'HOD', departmentId: cseDept ? cseDept.id : undefined },
        create: {
            name: 'HOD CSE',
            email: 'hodcse@dsw.com',
            password: hashedDefaultPassword,
            role: 'HOD',
            departmentId: cseDept ? cseDept.id : undefined
        }
    });
    console.log('Created HOD:', hod.email);

    if (cseDept) {
        await prisma.department.update({
            where: { id: cseDept.id },
            data: { hodId: hod.id }
        });
    }

    // 5. Club Coordinator (Hindi Samiti)
    const coordinator = await prisma.user.upsert({
        where: { email: 'hindisamiti@dsw.com' },
        update: { 
            password: hashedDefaultPassword, 
            role: 'CLUB_COORDINATOR',
            clubId: hindiClub ? hindiClub.id : undefined
        },
        create: {
            name: 'Hindi Samiti Coordinator',
            email: 'hindisamiti@dsw.com',
            password: hashedDefaultPassword,
            role: 'CLUB_COORDINATOR',
            clubId: hindiClub ? hindiClub.id : undefined
        }
    });
    console.log('Created Coordinator:', coordinator.email);

    // Link Hindi Samiti faculty advisor if club exists
    if (hindiClub) {
        await prisma.club.update({
            where: { id: hindiClub.id },
            data: { facultyAdvisorId: faculty2.id }
        });
    }

    // 6. Student
    const student = await prisma.user.upsert({
        where: { email: 'student@dsw.com' },
        update: { password: hashedDefaultPassword, role: 'STUDENT' },
        create: {
            name: 'Student User',
            email: 'student@dsw.com',
            password: hashedDefaultPassword,
            role: 'STUDENT',
            departmentId: cseDept ? cseDept.id : undefined
        }
    });
    console.log('Created Student:', student.email);

    console.log('User seeding completed successfully!');
}

seedUsers()
    .catch((err) => {
        console.error('Error seeding users:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
