import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This is for debugging only - remove in production
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ message: 'Not available in production' }, { status: 403 })
  }

  return NextResponse.json({
    razorpayKeyIdExists: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'NOT SET',
    razorpaySecretExists: !!process.env.RAZORPAY_KEY_SECRET,
    nodeEnv: process.env.NODE_ENV,
    availableEnvVars: Object.keys(process.env).filter(key => 
      key.includes('RAZORPAY') || key.includes('NEXT_PUBLIC')
    )
  })
}
