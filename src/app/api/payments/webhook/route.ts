import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json(
        { message: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature (important for production)
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (webhookSecret && process.env.NODE_ENV === 'production') {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.log('Webhook signature verification failed')
        return NextResponse.json(
          { message: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const event = JSON.parse(body)
    
    console.log('📨 Webhook received:', {
      event: event.event,
      paymentId: event.payload?.payment?.entity?.id,
      orderId: event.payload?.payment?.entity?.order_id,
      status: event.payload?.payment?.entity?.status
    })

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity)
        break
        
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity)
        break
        
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity)
        break
        
      default:
        console.log(`Unhandled webhook event: ${event.event}`)
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { message: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    console.log('💰 Payment captured:', {
      id: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      status: payment.status
    })

    // Extract plan information from payment notes or order receipt
    const planId = payment.notes?.planId || 'premium'
    const userId = payment.notes?.userId

    if (userId) {
      // Update user's subscription
      await User.findByIdAndUpdate(userId, {
        plan: planId,
        $push: {
          paymentHistory: {
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'captured',
            planId,
            createdAt: new Date()
          }
        }
      })

      console.log(`✅ User ${userId} upgraded to ${planId} plan`)
    }
  } catch (error) {
    console.error('Error handling payment captured:', error)
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    console.log('❌ Payment failed:', {
      id: payment.id,
      orderId: payment.order_id,
      errorCode: payment.error_code,
      errorDescription: payment.error_description
    })

    const userId = payment.notes?.userId
    if (userId) {
      // Log failed payment
      await User.findByIdAndUpdate(userId, {
        $push: {
          paymentHistory: {
            paymentId: payment.id,
            orderId: payment.order_id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'failed',
            errorCode: payment.error_code,
            errorDescription: payment.error_description,
            createdAt: new Date()
          }
        }
      })
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleOrderPaid(order: any) {
  try {
    console.log('📋 Order paid:', {
      id: order.id,
      amount: order.amount,
      status: order.status
    })
    // Additional order processing logic if needed
  } catch (error) {
    console.error('Error handling order paid:', error)
  }
}
