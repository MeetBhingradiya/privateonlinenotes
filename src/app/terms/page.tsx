import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, Shield, Lock, Users, Zap, Globe, CheckCircle, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/header'

export default function TermsPage() {
    const sections = [
        {
            icon: CheckCircle,
            title: "Acceptance of Terms",
            content: "By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement."
        },
        {
            icon: Zap,
            title: "Description of Service",
            content: "Notta.in is a fast, secure, markdown and UI rich note sharing platform designed for students and professionals. Our service allows you to create, edit, store, and share text files and code snippets. This service is intended for educational and professional collaboration purposes only."
        },
        {
            icon: Users,
            title: "User Accounts",
            content: [
                "You must provide accurate and complete information when creating an account",
                "You are responsible for maintaining the security of your account credentials",
                "You must notify us immediately of any unauthorized use of your account",
                "One person or legal entity may not maintain more than one account"
            ]
        },
        {
            icon: Shield,
            title: "Acceptable Use",
            content: [
                "Upload malicious code, viruses, or harmful content",
                "Share content that violates intellectual property rights",
                "Use the service for illegal activities",
                "Attempt to gain unauthorized access to our systems",
                "Spam or send unsolicited communications through our platform",
                "Store sensitive, confidential, or personal data (SSN, passwords, financial information, etc.)",
                "Upload files containing private or proprietary business information"
            ]
        },
        {
            icon: FileText,
            title: "Content and Intellectual Property",
            content: [
                "You retain ownership of content you upload to our service",
                "You grant us a license to store, process, and display your content as necessary to provide the service",
                "You are responsible for ensuring you have the right to share any content you upload"
            ]
        },
        {
            icon: Lock,
            title: "Privacy and Data Protection",
            content: "We take your privacy seriously. We collect and process your personal data in accordance with our Privacy Policy. By using our service, you consent to such processing and you warrant that all data provided by you is accurate."
        },
        {
            icon: Globe,
            title: "File Storage and Sharing",
            content: [
                "Files are stored on our servers for easy access and sharing",
                "You can control sharing permissions for your files",
                "We maintain version history for your files (last 5 versions)",
                "Shared files can be accessed by anyone with the share link",
                "We do not currently provide automated backups - please keep your own copies of important files",
                "Files are not encrypted at rest - avoid storing sensitive or confidential information"
            ]
        },
        {
            icon: AlertTriangle,
            title: "Data Security Notice",
            content: [
                "This platform is designed for educational and professional collaboration only",
                "Files are NOT encrypted and may be accessible to our technical staff for maintenance",
                "We do NOT provide regular backups - you are responsible for backing up your own data",
                "DO NOT store sensitive information such as passwords, personal data, or confidential business information",
                "Use this service only for non-sensitive documents, code snippets, notes, and educational materials",
                "We recommend treating all uploaded content as potentially public"
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/20">
            <Header />

            {/* Hero Section */}
            <div className="relative pt-20 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center space-x-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 dark:border-gray-700/30 mb-6">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Legal Documentation</span>
                            </div>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                            Terms & Conditions
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                            Please read these terms carefully before using our service
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Last updated: {new Date().toLocaleDateString()}</span>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>Effective immediately</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-20">
                <div className="max-w-4xl mx-auto">

                    {/* Navigation */}
                    <div className="mb-8 pt-8">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <Link href="/">
                                <Button
                                    variant="ghost"
                                    className="group hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                                    Back to Home
                                </Button>
                            </Link>

                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Legal Pages:</span>
                                <div className="flex items-center space-x-2">
                                    <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                                        Terms & Conditions
                                    </div>
                                    <Link href="/privacy">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-700/30"
                                        >
                                            Privacy Policy
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Introduction Card */}
                    <Card className="mb-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b border-gray-200/50 dark:border-gray-700/50">
                            <CardTitle className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                                <span>Welcome to Notta.in</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    These Terms and Conditions (&quot;Terms&quot;) govern your use of the Notta.in platform
                                    (&quot;Service&quot;) operated by Notta.in (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
                                    By using our service, you agree to these terms.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Terms Sections */}
                    <div className="grid gap-6 mb-8">
                        {sections.map((section, index) => (
                            <Card key={index} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center space-x-3">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${section.icon === Shield
                                                ? 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                                                : section.icon === AlertTriangle
                                                ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400'
                                                : 'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                                            }`}>
                                            <section.icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-lg font-semibold">{index + 1}. {section.title}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {Array.isArray(section.content) ? (
                                        <div>
                                            {section.title === "Acceptable Use" && (
                                                <p className="text-gray-700 dark:text-gray-300 mb-3">You agree not to:</p>
                                            )}
                                            {section.title === "Data Security Notice" && (
                                                <p className="text-orange-700 dark:text-orange-300 mb-3 font-medium">⚠️ Important Security Information:</p>
                                            )}
                                            <ul className="space-y-2">
                                                {section.content.map((item, itemIndex) => (
                                                    <li key={itemIndex} className="flex items-start space-x-3">
                                                        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${section.title === "Acceptable Use"
                                                                ? 'bg-red-400'
                                                                : section.title === "Data Security Notice"
                                                                ? 'bg-orange-400'
                                                                : 'bg-green-400'
                                                            }`}></div>
                                                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{section.content}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Additional Terms */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg flex items-center justify-center">
                                        <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <span>Service Availability</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300">
                                    While we strive to maintain high availability, we do not guarantee uninterrupted
                                    access to our service. We may temporarily suspend access for maintenance or updates.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-purple-100 dark:bg-purple-950/30 rounded-lg flex items-center justify-center">
                                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span>Account Termination</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300">
                                    You may delete your account at any time from your profile settings. We may
                                    terminate accounts that violate these terms. Upon termination, all your data
                                    will be permanently deleted.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Legal Information */}
                    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-3 gap-6 text-center">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Limitation of Liability</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Our service is provided &quot;as is&quot; without warranties of any kind. We shall not be
                                        liable for any indirect, incidental, special, consequential, or punitive damages.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Changes to Terms</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        We reserve the right to modify these terms at any time. We will notify users of
                                        significant changes via email or platform notifications.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Governing Law</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        These terms shall be governed by and construed in accordance with the laws of
                                        the jurisdiction where our company is registered.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Section */}
                    <div className="mt-8 text-center">
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-gray-700/30">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Questions?</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                If you have any questions about these Terms and Conditions, please contact us.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                <Link href="/contact">
                                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl">
                                        Contact Support
                                    </Button>
                                </Link>
                                <span className="text-gray-400 dark:text-gray-500">or</span>
                                <Link href="/privacy">
                                    <Button variant="outline" className="rounded-xl border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800">
                                        Read Privacy Policy
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
