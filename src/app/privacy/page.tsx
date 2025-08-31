import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Shield, Eye, Lock, Users, Database, Globe, Mail, CheckCircle, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/header'

export default function PrivacyPage() {
    const sections = [
        {
            icon: Database,
            title: "Information We Collect",
            subsections: [
                {
                    title: "Personal Information",
                    items: [
                        "Name and email address",
                        "Password (encrypted and securely stored)",
                        "Profile information and preferences",
                        "Files and documents you upload"
                    ]
                },
                {
                    title: "Usage Information", 
                    items: [
                        "Log data and analytics",
                        "Device information and browser type",
                        "IP address and general location data",
                        "Feature usage and interaction patterns"
                    ]
                }
            ]
        },
        {
            icon: Eye,
            title: "How We Use Your Information",
            content: [
                "Provide, maintain, and improve our services",
                "Process transactions and send important notifications",
                "Respond to your comments, questions, and support requests",
                "Prevent fraud, abuse, and unauthorized access",
                "Analyze usage patterns to enhance user experience"
            ]
        },
        {
            icon: Users,
            title: "Information Sharing",
            content: "We do not sell, trade, or otherwise transfer your personal information to third parties without your explicit consent, except as described in this policy or as required by law."
        },
        {
            icon: Lock,
            title: "Data Security",
            content: [
                "We implement appropriate security measures to protect your account information",
                "Files are stored on secure servers with access controls",
                "However, files are NOT encrypted at rest on our servers",
                "Our technical staff may have access to file contents for maintenance purposes",
                "We do NOT provide automated backups of your files",
                "You should treat all uploaded content as potentially accessible to others"
            ]
        },
        {
            icon: Shield,
            title: "Data Retention",
            content: "We retain your information for as long as your account is active or as needed to provide you services, comply with legal obligations, resolve disputes, and enforce our agreements."
        },
        {
            icon: CheckCircle,
            title: "Your Rights",
            content: [
                "Access and update your personal information",
                "Delete your account and associated data",
                "Export your data in a portable format",
                "Opt out of non-essential communications",
                "Request data correction or clarification"
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20">
            <Header />
            
            {/* Hero Section */}
            <div className="relative pt-20 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-600/10 to-purple-600/10"></div>
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center space-x-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 dark:border-gray-700/30 mb-6">
                                <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy & Security</span>
                            </div>
                        </div>
                        
                        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                            Your privacy is important to us. Learn how we collect, use, and protect your data.
                        </p>
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>Last updated: {new Date().toLocaleDateString()}</span>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>GDPR Compliant</span>
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
                                    <Link href="/terms">
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            className="hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-700/30"
                                        >
                                            Terms & Conditions
                                        </Button>
                                    </Link>
                                    <div className="px-3 py-1.5 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
                                        Privacy Policy
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Introduction Card */}
                    <Card className="mb-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-b border-gray-200/50 dark:border-gray-700/50">
                            <CardTitle className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-green-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-white" />
                                </div>
                                <span>Our Commitment to Privacy</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    At Notta.in, we are committed to protecting your privacy and ensuring the security of your personal information. 
                                    This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {/* Privacy Sections */}
                    <div className="grid gap-6 mb-8">
                        {sections.map((section, index) => (
                            <Card key={index} className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <section.icon className="h-4 w-4" />
                                        </div>
                                        <span className="text-lg font-semibold">{index + 1}. {section.title}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {section.subsections ? (
                                        <div className="space-y-4">
                                            {section.subsections.map((subsection, subIndex) => (
                                                <div key={subIndex}>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{subsection.title}:</h4>
                                                    <ul className="space-y-2">
                                                        {subsection.items.map((item, itemIndex) => (
                                                            <li key={itemIndex} className="flex items-start space-x-3">
                                                                <div className="mt-1.5 h-2 w-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                                                <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : Array.isArray(section.content) ? (
                                        <ul className="space-y-2">
                                            {section.content.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-start space-x-3">
                                                    <div className="mt-1.5 h-2 w-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{section.content}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Data Protection & Compliance */}
                    <div className="grid md:grid-cols-1 gap-6 mb-8">
                        <Card className="bg-orange-50/70 dark:bg-orange-950/20 backdrop-blur-xl border-orange-200/50 dark:border-orange-700/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-orange-100 dark:bg-orange-950/30 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span>Important Security Notice</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <p className="text-orange-800 dark:text-orange-200 font-medium">
                                        ⚠️ This platform is designed for educational and professional collaboration only.
                                    </p>
                                    <ul className="space-y-2 text-orange-700 dark:text-orange-300">
                                        <li className="flex items-start space-x-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>Files are NOT encrypted and should be considered potentially accessible to others</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>We do NOT provide regular backups - you are responsible for backing up your own data</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>DO NOT store sensitive information such as passwords, personal data, or confidential business information</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <span className="text-orange-500 mt-1">•</span>
                                            <span>Use only for non-sensitive documents, code snippets, notes, and educational materials</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Privacy Information */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center">
                                        <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span>International Transfers</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Your information may be transferred to and processed in countries other than your own. 
                                    We ensure appropriate safeguards are in place to protect your privacy rights.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-white/30 dark:border-gray-700/30 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-orange-100 dark:bg-orange-950/30 rounded-lg flex items-center justify-center">
                                        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span>Data Breach Notification</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 dark:text-gray-300">
                                    In the unlikely event of a data breach, we will notify affected users and relevant 
                                    authorities within 72 hours as required by applicable data protection laws.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Policy Updates & Contact */}
                    <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 mb-8">
                        <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                        <div className="h-6 w-6 bg-blue-100 dark:bg-blue-950/30 rounded-lg flex items-center justify-center mr-2">
                                            <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        Policy Updates
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        We may update this Privacy Policy from time to time. We will notify you of any changes 
                                        by posting the new policy on this page and updating the "Last updated" date.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                                        <div className="h-6 w-6 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center mr-2">
                                            <Mail className="h-3 w-3 text-green-600 dark:text-green-400" />
                                        </div>
                                        Data Protection Officer
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        For specific privacy concerns or data protection inquiries, you can contact our 
                                        Data Protection Officer at privacy@notta.in.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Section */}
                    <div className="text-center">
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-gray-700/30">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Privacy Questions?</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                If you have any questions about this Privacy Policy or our privacy practices, please don't hesitate to contact us.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                <Link href="/contact">
                                    <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-xl">
                                        Contact Us
                                    </Button>
                                </Link>
                                <a href="mailto:privacy@notta.in">
                                    <Button variant="outline" className="rounded-xl border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800">
                                        <Mail className="h-4 w-4 mr-2" />
                                        privacy@notta.in
                                    </Button>
                                </a>
                                <span className="text-gray-400 dark:text-gray-500">or</span>
                                <Link href="/terms">
                                    <Button variant="outline" className="rounded-xl border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800">
                                        Read Terms & Conditions
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
