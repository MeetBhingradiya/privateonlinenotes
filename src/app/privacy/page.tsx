import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/header'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <Link href="/auth/register">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Privacy Policy</h1>
                        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy Policy</CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <h3>1. Information We Collect</h3>
                            <p>
                                We collect information you provide directly to us, such as when you create an account,
                                upload files, or contact us for support.
                            </p>

                            <h4>Personal Information:</h4>
                            <ul>
                                <li>Name and email address</li>
                                <li>Password (encrypted)</li>
                                <li>Profile information</li>
                                <li>Files and documents you upload</li>
                            </ul>

                            <h4>Usage Information:</h4>
                            <ul>
                                <li>Log data and analytics</li>
                                <li>Device information</li>
                                <li>IP address and location data</li>
                            </ul>

                            <h3>2. How We Use Your Information</h3>
                            <p>We use the information we collect to:</p>
                            <ul>
                                <li>Provide, maintain, and improve our services</li>
                                <li>Process transactions and send notifications</li>
                                <li>Respond to your comments and questions</li>
                                <li>Prevent fraud and abuse</li>
                            </ul>

                            <h3>3. Information Sharing</h3>
                            <p>
                                We do not sell, trade, or otherwise transfer your personal information to third parties
                                without your consent, except as described in this policy.
                            </p>

                            <h3>4. Data Security</h3>
                            <p>
                                We implement appropriate security measures to protect your personal information against
                                unauthorized access, alteration, disclosure, or destruction.
                            </p>

                            <h3>5. Data Retention</h3>
                            <p>
                                We retain your information for as long as your account is active or as needed to
                                provide you services and comply with legal obligations.
                            </p>

                            <h3>6. Your Rights</h3>
                            <p>You have the right to:</p>
                            <ul>
                                <li>Access and update your personal information</li>
                                <li>Delete your account and data</li>
                                <li>Export your data</li>
                                <li>Opt out of communications</li>
                            </ul>

                            <h3>7. Contact Us</h3>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at{' '}
                                <a href="mailto:privacy@notta.in" className="text-blue-600 hover:text-blue-500">
                                    privacy@notta.in
                                </a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
