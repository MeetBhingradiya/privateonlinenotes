import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/auth/register">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Registration
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Terms and Conditions</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome to Notta.in</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                These Terms and Conditions (&quot;Terms&quot;) govern your use of the Notta.in platform 
                (&quot;Service&quot;) operated by Notta.in (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
              </p>

              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using this service, you accept and agree to be bound by the 
                terms and provision of this agreement.
              </p>

              <h3>2. Description of Service</h3>
              <p>
                Notta.in is a fast, secure, markdown and UI rich note sharing platform designed 
                for students and professionals. Our service allows you to create, edit, store, 
                and share text files and code snippets.
              </p>

              <h3>3. User Accounts</h3>
              <ul>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>One person or legal entity may not maintain more than one account</li>
              </ul>

              <h3>4. Acceptable Use</h3>
              <p>You agree not to:</p>
              <ul>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Share content that violates intellectual property rights</li>
                <li>Use the service for illegal activities</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Spam or send unsolicited communications through our platform</li>
              </ul>

              <h3>5. Content and Intellectual Property</h3>
              <ul>
                <li>You retain ownership of content you upload to our service</li>
                <li>You grant us a license to store, process, and display your content as necessary to provide the service</li>
                <li>You are responsible for ensuring you have the right to share any content you upload</li>
              </ul>

              <h3>6. Privacy and Data Protection</h3>
              <p>
                We take your privacy seriously. We collect and process your personal data in 
                accordance with our Privacy Policy. By using our service, you consent to such 
                processing and you warrant that all data provided by you is accurate.
              </p>

              <h3>7. File Storage and Sharing</h3>
              <ul>
                <li>Files are stored securely and backed up regularly</li>
                <li>You can control sharing permissions for your files</li>
                <li>We maintain version history for your files (last 5 versions)</li>
                <li>Shared files can be accessed by anyone with the share link</li>
              </ul>

              <h3>8. Service Availability</h3>
              <p>
                While we strive to maintain high availability, we do not guarantee uninterrupted 
                access to our service. We may temporarily suspend access for maintenance or 
                updates.
              </p>

              <h3>9. Account Termination</h3>
              <p>
                You may delete your account at any time from your profile settings. We may 
                terminate accounts that violate these terms. Upon termination, all your data 
                will be permanently deleted.
              </p>

              <h3>10. Limitation of Liability</h3>
              <p>
                Our service is provided &quot;as is&quot; without warranties of any kind. We shall not be 
                liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>

              <h3>11. Changes to Terms</h3>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of 
                significant changes via email or platform notifications.
              </p>

              <h3>12. Contact Information</h3>
              <p>
                If you have any questions about these Terms and Conditions, please contact us 
                through our support channels.
              </p>

              <h3>13. Governing Law</h3>
              <p>
                These terms shall be governed by and construed in accordance with the laws of 
                the jurisdiction where our company is registered.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
