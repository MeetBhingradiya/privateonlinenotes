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
    enum: ['free', 'premium'],
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
