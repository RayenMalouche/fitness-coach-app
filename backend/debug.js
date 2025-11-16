// Debug script to check server setup
console.log('🔍 Starting debug checks...\n');

// 1. Check Node version
console.log('1️⃣ Node.js version:', process.version);

// 2. Check environment variables
require('dotenv').config();
console.log('\n2️⃣ Environment Variables:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('   PORT:', process.env.PORT || '5000 (default)');

// 3. Check required modules
console.log('\n3️⃣ Checking dependencies:');
const dependencies = [
  'express',
  'cors',
  'dotenv',
  'bcryptjs',
  'jsonwebtoken',
  'multer',
  '@prisma/client'
];

dependencies.forEach(dep => {
  try {
    require(dep);
    console.log(`   ${dep}: ✅`);
  } catch (e) {
    console.log(`   ${dep}: ❌ MISSING - Run: npm install ${dep}`);
  }
});

// 4. Check Prisma connection
console.log('\n4️⃣ Testing database connection:');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => {
    console.log('   Database: ✅ Connected');
    return prisma.user.count();
  })
  .then((count) => {
    console.log(`   Users in database: ${count}`);
    return prisma.$disconnect();
  })
  .then(() => {
    console.log('\n✅ All checks passed! Server should work now.');
    console.log('\n💡 Run: npm run dev');
  })
  .catch((error) => {
    console.log('   Database: ❌ Connection failed');
    console.error('   Error:', error.message);
    console.log('\n💡 Solutions:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check DATABASE_URL in .env file');
    console.log('   3. Run: npx prisma migrate dev');
    process.exit(1);
  });