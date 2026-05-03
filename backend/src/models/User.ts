import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge {
  id: string;
  name: string;
  icon: string;
  unlockedAt: Date;
}

export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  
  // Gamification synced from mobile Zustand store
  streak: number;
  xp: number;
  level: number;
  hearts: number;
  coins: number;
  completedQuests: string[];
  badges: IBadge[];
  lastVisitDate: Date;
  
  // Additional profile
  bio?: string;
  favoriteVerse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  avatar: String,

  streak: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  hearts: { type: Number, default: 5 },
  coins: { type: Number, default: 0 },
  completedQuests: [{ type: String }],
  badges: [{
    id: String,
    name: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  lastVisitDate: { type: Date, default: Date.now },

  bio: String,
  favoriteVerse: String,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for next level XP
UserSchema.virtual('nextLevelXP').get(function() {
  return this.level * 500;
});

export default mongoose.model<IUser>('User', UserSchema);
