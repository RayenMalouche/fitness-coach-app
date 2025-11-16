// Database Seed Script
// Creates initial coach account for testing

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create a default coach account
    const coachEmail = 'coach@example.com';
    const coachPassword = 'password123';

    // Check if coach already exists
    const existingCoach = await prisma.user.findUnique({
      where: { email: coachEmail }
    });

    if (existingCoach) {
      console.log('⚠️  Coach account already exists');
    } else {
      const hashedPassword = await bcrypt.hash(coachPassword, 10);

      const coach = await prisma.user.create({
        data: {
          email: coachEmail,
          password: hashedPassword,
          name: 'John Coach',
          role: 'COACH',
          approved: true
        }
      });

      console.log('✅ Coach account created:');
      console.log(`   Email: ${coachEmail}`);
      console.log(`   Password: ${coachPassword}`);
      console.log(`   ID: ${coach.id}`);
    }

    // Create a sample approved client for testing
    const clientEmail = 'client@example.com';
    const clientPassword = 'password123';

    const existingClient = await prisma.user.findUnique({
      where: { email: clientEmail }
    });

    if (existingClient) {
      console.log('⚠️  Sample client already exists');
    } else {
      const hashedPassword = await bcrypt.hash(clientPassword, 10);

      const client = await prisma.user.create({
        data: {
          email: clientEmail,
          password: hashedPassword,
          name: 'Jane Client',
          role: 'CLIENT',
          approved: true
        }
      });

      // Create session credits for the client
      await prisma.sessionCredit.create({
        data: {
          clientId: client.id,
          totalCredits: 10,
          usedCredits: 0
        }
      });

      console.log('✅ Sample client account created:');
      console.log(`   Email: ${clientEmail}`);
      console.log(`   Password: ${clientPassword}`);
      console.log(`   ID: ${client.id}`);
      console.log(`   Credits: 10`);
    }

    console.log('🎉 Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();