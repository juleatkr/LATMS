// Check environment variables
require('dotenv').config();

console.log('Environment Variables Check:');
console.log('============================');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('');

if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL is missing!');
    console.log('');
    console.log('Please add this line to your .env file:');
    console.log('DATABASE_URL="file:./prisma/dev.db"');
    console.log('');
}
