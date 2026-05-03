import mongoose from 'mongoose';
import User from '../models/User';
import Quest from '../models/Quest';
import BibleSnippet from '../models/BibleSnippet';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { BOON_SENDER_ID } from '../utils/chatAccess';

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('Set MONGODB_URI in backend/.env');
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    await Quest.bulkWrite([
      {
        updateOne: {
          filter: { slug: 'daily-word' },
          update: {
            $set: {
              slug: 'daily-word',
              title: 'Daily Word',
              description: 'Open the app and read today’s chapter for 5 minutes.',
              xpReward: 25,
              order: 1,
              category: 'habits',
              isActive: true,
            },
          },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { slug: 'psalm-prayer' },
          update: {
            $set: {
              slug: 'psalm-prayer',
              title: 'Pray with a Psalm',
              description: 'Read Psalm 23 aloud and journal one line that stands out.',
              xpReward: 40,
              order: 2,
              category: 'prayer',
              isActive: true,
            },
          },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { slug: 'life-of-christ-1' },
          update: {
            $set: {
              slug: 'life-of-christ-1',
              title: 'Life of Christ — Week 1',
              description: 'Walk through Matthew 5–7: the Sermon on the Mount.',
              xpReward: 120,
              order: 10,
              category: 'series',
              isActive: true,
            },
          },
          upsert: true,
        },
      },
    ]);

    await BibleSnippet.bulkWrite([
      {
        updateOne: {
          filter: { reference: 'Psalm 23:1' },
          update: {
            $set: {
              reference: 'Psalm 23:1',
              book: 'Psalms',
              chapter: 23,
              verseStart: 1,
              text: 'The Lord is my shepherd; I shall not want.',
              translation: 'WEB',
              themes: ['trust', 'provision', 'rest'],
            },
          },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { reference: 'John 1:5' },
          update: {
            $set: {
              reference: 'John 1:5',
              book: 'John',
              chapter: 1,
              verseStart: 5,
              text: 'The light shines in the darkness, and the darkness hasn’t overcome it.',
              translation: 'WEB',
              themes: ['hope', 'light', 'christ'],
            },
          },
          upsert: true,
        },
      },
      {
        updateOne: {
          filter: { reference: 'Isaiah 41:10' },
          update: {
            $set: {
              reference: 'Isaiah 41:10',
              book: 'Isaiah',
              chapter: 41,
              verseStart: 10,
              text: "Don't you be afraid, for I am with you. Don't be dismayed, for I am your God. I will strengthen you. Yes, I will help you. Yes, I will uphold you with the right hand of my righteousness.",
              translation: 'WEB',
              themes: ['courage', 'presence', 'comfort'],
            },
          },
          upsert: true,
        },
      },
    ]);

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
        completedQuests: ['life-of-christ-1', 'psalm-prayer'],
        badges: [
          { id: 'first-steps', name: 'First Steps', icon: '🌱', unlockedAt: new Date() },
          { id: 'faithful-one', name: 'Faithful One', icon: '🕊️', unlockedAt: new Date() },
        ],
        lastVisitDate: new Date(),
      },
      { upsert: true }
    );

    const demoId = 'demo-user-123';
    const aiChat = await Chat.findOneAndUpdate(
      { kind: 'ai', participants: demoId },
      {
        participants: [demoId],
        kind: 'ai',
        createdBy: demoId,
        title: 'Bōōns',
        lastMessage: 'Welcome to Bornblix!',
        lastMessageAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (aiChat) {
      const count = await Message.countDocuments({ chatId: aiChat._id });
      if (count === 0) {
        await Message.insertMany([
          {
            chatId: aiChat._id,
            senderId: BOON_SENDER_ID,
            content:
              'Welcome to Bornblix! I’m Bōōns — walk with me through the Word today. What’s on your heart?',
            type: 'ai',
            metadata: { seeded: true },
          },
          {
            chatId: aiChat._id,
            senderId: demoId,
            content: 'I want to start a short reading habit this week.',
            type: 'text',
          },
        ]);
      }
    }

    console.log('✅ Bornblix seed complete (quests, snippets, demo user, AI thread)');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
