import { NextRequest, NextResponse } from 'next/server'
import { initializeModels } from '@/models'

// In production, you would integrate with email service like SendGrid, AWS SES, etc.
const sendEmail = async (to: string, subject: string, message: string, from: string, name: string) => {
  // Mock email sending - replace with actual email service
  console.log('Email would be sent:', { to: 'support@notta.in', from, name, subject, message })
  return true
}

export async function POST(request: NextRequest) {
  try {
    await initializeModels() // Initialize DB connection
    
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Send email to support team
    await sendEmail(
      'support@notta.in',
      `Contact Form: ${subject}`,
      `
From: ${name} (${email})
Subject: ${subject}

Message:
${message}
      `,
      email,
      name
    )

    // In production, you might also want to save the contact form submission to database
    // const ContactSubmission = mongoose.model('ContactSubmission', {
    //   name: String,
    //   email: String,
    //   subject: String,
    //   message: String,
    //   createdAt: { type: Date, default: Date.now }
    // })
    // await new ContactSubmission({ name, email, subject, message }).save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
