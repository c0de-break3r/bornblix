import mongoose from 'mongoose';
import User from '../models/User';
// Import models directly to register them
import '../models/User';


const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB for seeding...');

    // Create demo user
    await User.findOneAndUpdate(
      { clerkId: 'demo-user-123' },
      {
        clerkId: 'demo-user-123',
        email: 'demo@bornblix.com',
        firstName: 'Caroline',
        streak: 7,
        xp: 1240,
        level: 14,
        hearts: 3,
        coins: 245,
        completedQuests: ['life-of-christ-1', 'psalms-peace-3'],
        badges: [
          { id: 'first-steps', name: 'First Steps', icon: '🌱', unlockedAt: new Date() },
          { id: 'faithful-one', name: 'Faithful One', icon: '🕊️', unlockedAt: new Date() }
        ],
        lastVisitDate: new Date()
      },
      { upsert: true }
    );

    console.log('✅ Bornblix seed data created successfully!');
    console.log('   Demo user ready with streak = 7, level 14');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
