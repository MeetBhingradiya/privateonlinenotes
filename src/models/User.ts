import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  isAnonymous: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  otpCode?: string;
  otpExpires?: Date;
  passkeys: Array<{
    id: string;
    publicKey: string;
    counter: number;
    name: string;
    createdAt: Date;
  }>;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  subscription: {
    type: 'free' | 'premium';
    expiresAt?: Date;
  };
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function(this: IUser): boolean {
      return !this.isAnonymous;
    },
    minlength: 6
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  otpCode: String,
  otpExpires: Date,
  passkeys: [{
    id: String,
    publicKey: String,
    counter: Number,
    name: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    expiresAt: Date
  },
  lastLoginAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
// Note: email index is automatically created by unique: true
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
