// backend/seed-users.js
// Quick script to create test users

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-chat';

const testUsers = [
  { name: 'John Doe', email: 'john@test.com', password: 'password123' },
  { name: 'Jane Smith', email: 'jane@test.com', password: 'password123' },
  { name: 'Bob Wilson', email: 'bob@test.com', password: 'password123' },
  { name: 'Alice Brown', email: 'alice@test.com', password: 'password123' },
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = mongoose.model('User', {
      name: String,
      email: String,
      password: String,
      role: { type: String, default: 'user' },
      isOnline: { type: Boolean, default: false },
      lastSeen: { type: Date, default: Date.now },
    }, 'users');
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (!existingUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        
        await User.create({
          ...userData,
          password: hashedPassword,
        });
        
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }
    
    console.log('\n🎉 Done! You can now login with:');
    testUsers.forEach(u => {
      console.log(`   Email: ${u.email} | Password: ${u.password}`);
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedUsers();