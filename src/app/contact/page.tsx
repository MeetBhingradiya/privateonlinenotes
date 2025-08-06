import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GlassCard } from '@/components/ui/glass-card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact Us - PrivateOnlineNotes",
  description: "Get in touch with our team. We're here to help with any questions about our secure markdown file sharing platform.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 py-20">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
          Get in Touch
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Have questions about PrivateOnlineNotes? We&apos;d love to hear from you. 
          Send us a message and we&apos;ll respond as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Form */}
        <GlassCard className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Send us a Message
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Fill out the form below and we&apos;ll get back to you within 24 hours.
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full"
                  placeholder="Your first name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full"
                  placeholder="Your last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="w-full"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject
              </label>
              <Input
                id="subject"
                name="subject"
                type="text"
                required
                className="w-full"
                placeholder="What is this regarding?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Send className="h-5 w-5 mr-2" />
              Send Message
            </Button>
          </form>
        </GlassCard>

        {/* Contact Information */}
        <div className="space-y-8">
          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Contact Information
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Email</h3>
                  <p className="text-slate-600 dark:text-slate-300">support@privateonlinenotes.com</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">We aim to respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Live Chat</h3>
                  <p className="text-slate-600 dark:text-slate-300">Available Monday-Friday</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">9:00 AM - 6:00 PM EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Documentation</h3>
                  <p className="text-slate-600 dark:text-slate-300">Find answers in our help center</p>
                  <Link href="/docs" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    Browse Documentation →
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Quick Help
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Common Questions</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <li>• How do I create a private note?</li>
                  <li>• Can I share notes without creating an account?</li>
                  <li>• How do I delete my account?</li>
                  <li>• What file formats are supported?</li>
                </ul>
              </div>
              
              <div className="pt-4">
                <Link href="/docs/faq">
                  <Button variant="outline" className="w-full">
                    View All FAQs
                  </Button>
                </Link>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Response Time
            </h2>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-slate-600 dark:text-slate-300">
                  We typically respond to all inquiries within <strong>24 hours</strong> during business days.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-20">
        <GlassCard className="p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Need Immediate Help?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Check out our documentation or start creating notes right away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <Link href="/docs">
                Browse Documentation
              </Link>
            </Button>
            <Button asChild>
              <Link href="/create">
                Create Your First Note
              </Link>
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
