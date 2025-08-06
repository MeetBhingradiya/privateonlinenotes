import mongoose, { Document, Schema } from 'mongoose';

export enum FilePermission {
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  PRIVATE = 'private'
}

export interface IFile extends Document {
  title: string;
  slug: string;
  description?: string;
  permission: FilePermission;
  author?: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  anonymousAuthor?: {
    name: string;
    sessionId: string;
  };
  isPinned: boolean;
  tags: string[];
  language: string;
  fileSize: number;
  viewCount: number;
  lastViewedAt?: Date;
  expiresAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  permission: {
    type: String,
    enum: Object.values(FilePermission),
    default: FilePermission.PRIVATE
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: IFile): boolean {
      return !this.isAnonymous;
    }
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  anonymousAuthor: {
    name: String,
    sessionId: String
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  language: {
    type: String,
    default: 'markdown'
  },
  fileSize: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: Date,
  expiresAt: Date, // For anonymous files
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  version: {
    type: Number,
    default: 1
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
// Note: slug index is automatically created by unique: true
FileSchema.index({ author: 1, createdAt: -1 });
FileSchema.index({ permission: 1 });
FileSchema.index({ isDeleted: 1 });
FileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
FileSchema.index({ tags: 1 });
FileSchema.index({ createdAt: -1 });
FileSchema.index({ viewCount: -1 });

// Pre-save middleware to generate slug if not provided
FileSchema.pre('save', function(this: IFile, next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  }
  next();
});

export default mongoose.models.File || mongoose.model<IFile>('File', FileSchema);
