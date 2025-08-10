import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User'

// Mock Razorpay for development - replace with actual Razorpay in production
const createRazorpayOrder = async (amount: number, currency: string = 'INR', notes: any = {}) => {
  // In production, use actual Razorpay SDK
  // const Razorpay = require('razorpay')
  // const instance = new Razorpay({
  //   key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  //   key_secret: process.env.RAZORPAY_KEY_SECRET,
  // })
  // 
  // return await instance.orders.create({
  //   amount,
  //   currency,
  //   notes,
  //   receipt: `receipt_${Date.now()}`
  // })
  
  // For development, return a mock order
  return {
    id: `order_${Date.now()}`,
    amount,
    currency,
    status: 'created',
    notes
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting order creation...')
    await dbConnect()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      console.log('❌ No authentication token found')
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      console.log('❌ User not found:', decoded.userId)
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ User authenticated:', user.email)
    
    const { planId, amount } = await request.json()

    if (!planId || !amount) {
      console.log('❌ Missing planId or amount:', { planId, amount })
      return NextResponse.json(
        { message: 'Plan ID and amount are required' },
        { status: 400 }
      )
    }

    console.log('📋 Order details:', { planId, amount, userId: user._id })

    // Create order notes with user and plan information
    const notes = {
      userId: user._id.toString(),
      userEmail: user.email,
      planId,
      planName: planId.charAt(0).toUpperCase() + planId.slice(1)
    }

    // Create Razorpay order
    const order = await createRazorpayOrder(amount, 'INR', notes)

    console.log('💳 Order created successfully:', {
      orderId: order.id,
      amount: order.amount,
      userId: user._id,
      planId
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('💥 Payment order creation error:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
