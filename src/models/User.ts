import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free',
  },
  avatar: String,
  isBlocked: {
    type: Boolean,
    default: false,
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
  name: string
  email: string
  password: string
  plan: 'free' | 'premium' | 'enterprise'
  avatar?: string
  isBlocked: boolean
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
