#!/usr/bin/env node

/**
 * Firebase Integration Setup Script
 * This script helps complete the Firebase integration in one go
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Firebase Integration Setup\n');
console.log('='.repeat(50));

// Step 1: Check .env file
console.log('\n📋 Step 1: Checking environment variables...');
try {
    require('dotenv').config();

    if (!process.env.DATABASE_URL) {
        console.log('❌ DATABASE_URL is not set in .env file');
        console.log('\n⚠️  Please add this line to your .env file:');
        console.log('DATABASE_URL="file:./prisma/dev.db"');
        console.log('\nThen run this script again.');
        process.exit(1);
    }

    console.log('✅ DATABASE_URL is set');
} catch (error) {
    console.log('⚠️  Could not load .env file. Make sure it exists.');
}

// Step 2: Generate Prisma Client
console.log('\n📋 Step 2: Generating Prisma client...');
try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');
} catch (error) {
    console.log('❌ Failed to generate Prisma client');
    console.log('Please run manually: npx prisma generate');
    process.exit(1);
}

// Step 3: Ask user if they want to run migration
console.log('\n📋 Step 3: Ready to migrate data to Firebase');
console.log('\n⚠️  This will copy all data from SQLite to Firebase.');
console.log('⚠️  Make sure you have a backup of your database!');
console.log('\nTo run migration, execute:');
console.log('  npm run migrate:firebase');
console.log('\nOr:');
console.log('  npx tsx scripts/migrate-to-firestore.ts');

console.log('\n' + '='.repeat(50));
console.log('\n✅ Setup complete!');
console.log('\n📚 Next steps:');
console.log('  1. Run migration: npm run migrate:firebase');
console.log('  2. Deploy Firebase rules: firebase deploy --only firestore:rules');
console.log('  3. Update API routes to use dual-write service');
console.log('\n📖 See docs/ACTION_CHECKLIST.md for detailed instructions');
