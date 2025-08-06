import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  anonymousName?: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: Date;
  data: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  anonymousName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
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
SessionSchema.index({ sessionId: 1 });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ lastActivity: -1 });
SessionSchema.index({ expiresAt: 1 });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
