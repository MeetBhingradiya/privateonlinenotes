import nodemailer from 'nodemailer'

interface EmailConfig {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail({ to, subject, html, text }: EmailConfig) {
    try {
      const mailOptions = {
        from: {
          name: process.env.SMTP_FROM_NAME || 'NottaIn',
          address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@nottain.com',
        },
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async sendPasswordResetEmail(email: string, resetLink: string, username: string) {
    const subject = 'Reset Your NottaIn Password'
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .content h2 { color: #333; margin-top: 0; font-size: 24px; }
            .content p { margin: 16px 0; font-size: 16px; line-height: 1.6; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; transition: transform 0.2s; }
            .button:hover { transform: translateY(-2px); }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; }
            .footer p { margin: 0; font-size: 14px; color: #6c757d; }
            .security-notice { background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
            .link-fallback { word-break: break-all; font-size: 14px; color: #6c757d; background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello, ${username}!</h2>
              <p>We received a request to reset your password for your NottaIn account. If you made this request, click the button below to reset your password:</p>
              
              <a href="${resetLink}" class="button">Reset My Password</a>
              
              <div class="security-notice">
                <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, you can safely ignore this email.
              </div>
              
              <p>If the button above doesn't work, copy and paste this link into your browser:</p>
              <div class="link-fallback">${resetLink}</div>
              
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>Best regards,<br>The NottaIn Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} NottaIn. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
Reset Your NottaIn Password

Hello, ${username}!

We received a request to reset your password for your NottaIn account. If you made this request, visit the following link to reset your password:

${resetLink}

This link will expire in 1 hour for your security.

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The NottaIn Team

© ${new Date().getFullYear()} NottaIn. All rights reserved.
This is an automated message, please do not reply to this email.
    `.trim()

    return this.sendEmail({ to: email, subject, html, text })
  }

  async sendUsernameRecoveryEmail(email: string, username: string) {
    const subject = 'Your NottaIn Username'
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Username Recovery</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .content h2 { color: #333; margin-top: 0; font-size: 24px; }
            .content p { margin: 16px 0; font-size: 16px; line-height: 1.6; }
            .username-box { background-color: #f8f9fa; border: 2px solid #667eea; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .username-box .username { font-size: 24px; font-weight: 700; color: #667eea; font-family: monospace; }
            .footer { background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; }
            .footer p { margin: 0; font-size: 14px; color: #6c757d; }
            .security-notice { background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👤 Username Recovery</h1>
            </div>
            <div class="content">
              <h2>Username Found!</h2>
              <p>We found your NottaIn account associated with this email address. Here's your username:</p>
              
              <div class="username-box">
                <div class="username">${username}</div>
              </div>
              
              <div class="security-notice">
                <strong>Security Tip:</strong> Keep your username safe and consider saving it in a secure location for future reference.
              </div>
              
              <p>You can now use this username to log in to your NottaIn account. If you've also forgotten your password, you can use the "Forgot Password" option on the login page.</p>
              
              <p>If you didn't request this username recovery, someone may have entered your email address by mistake. You can safely ignore this email.</p>
              
              <p>Best regards,<br>The NottaIn Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} NottaIn. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
Your NottaIn Username

Username Found!

We found your NottaIn account associated with this email address. Here's your username:

${username}

You can now use this username to log in to your NottaIn account. If you've also forgotten your password, you can use the "Forgot Password" option on the login page.

If you didn't request this username recovery, someone may have entered your email address by mistake. You can safely ignore this email.

Best regards,
The NottaIn Team

© ${new Date().getFullYear()} NottaIn. All rights reserved.
This is an automated message, please do not reply to this email.
    `.trim()

    return this.sendEmail({ to: email, subject, html, text })
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<style[^>]*>.*?<\/style>/gim, '')
      .replace(/<script[^>]*>.*?<\/script>/gim, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      console.log('SMTP connection verified successfully')
      return true
    } catch (error) {
      console.error('SMTP connection failed:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
