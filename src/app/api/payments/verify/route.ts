import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User'

const verifyRazorpaySignature = (_orderId: string, _paymentId: string, _signature: string) => {
  // In production, use actual Razorpay verification
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  //   .update(orderId + '|' + paymentId)
  //   .digest('hex')
  
  // For development, always return true
  return true
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    const { orderId, paymentId, signature, planId } = await request.json()

    // Verify payment signature
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature)
    
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // Update user plan
    await User.findByIdAndUpdate(decoded.userId, {
      plan: planId,
      $push: {
        paymentHistory: {
          orderId,
          paymentId,
          planId,
          amount: planId === 'premium' ? 29900 : 99900, // amounts in paise
          createdAt: new Date()
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
