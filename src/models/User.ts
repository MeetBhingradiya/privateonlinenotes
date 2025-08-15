import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true, // Allow multiple documents without email
    // Don't set any default value to ensure field is omitted when not provided
  },
  password: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
  },
  avatar: String,
  isBlocked: {
    type: Boolean,
    default: false,
  },
  resetToken: {
    type: String,
    required: false,
  },
  resetTokenExpiry: {
    type: Date,
    required: false,
  },
  paymentHistory: [{
    orderId: String,
    paymentId: String,
    planId: String,
    amount: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

UserSchema.pre('save', function() {
  this.updatedAt = new Date()
})

export const User = mongoose.models.User || mongoose.model('User', UserSchema)

export interface IUser {
  _id: string
  name?: string
  username: string
  email?: string
  password: string
  plan: 'free' | 'pro' | 'premium'
  avatar?: string
  isBlocked: boolean
  resetToken?: string
  resetTokenExpiry?: Date
  paymentHistory: Array<{
    orderId: string
    paymentId: string
    planId: string
    amount: number
    createdAt: Date
  }>
  createdAt: Date
  updatedAt: Date
}
