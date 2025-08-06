import mongoose, { Document, Schema } from 'mongoose';

export interface IFileContent extends Document {
  fileId: mongoose.Types.ObjectId;
  content: string;
  version: number;
  encoding: string;
  size: number;
  checksum: string;
  isCompressed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileContentSchema = new Schema<IFileContent>({
  fileId: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  encoding: {
    type: String,
    default: 'utf-8'
  },
  size: {
    type: Number,
    required: true
  },
  checksum: {
    type: String,
    required: true
  },
  isCompressed: {
    type: Boolean,
    default: false
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
FileContentSchema.index({ fileId: 1, version: -1 });
FileContentSchema.index({ createdAt: -1 });
FileContentSchema.index({ size: -1 });

// Pre-save middleware to calculate size and checksum
FileContentSchema.pre('save', function(next: mongoose.CallbackWithoutResultAndOptionalError) {
  if (this.isModified('content')) {
    // Calculate size in bytes
    this.size = Buffer.byteLength(this.content, 'utf-8');
    
    // Simple checksum calculation (in production, use crypto.createHash)
    this.checksum = Buffer.from(this.content).toString('base64').slice(0, 16);
  }
  next();
});

export default mongoose.models.FileContent || mongoose.model<IFileContent>('FileContent', FileContentSchema);
