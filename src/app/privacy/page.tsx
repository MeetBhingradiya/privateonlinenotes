import { GlassCard } from '@/components/ui/glass-card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-white/70">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <GlassCard className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Account information (name, email address, password)</li>
                <li>Content you create and share through our platform</li>
                <li>Communication preferences and settings</li>
                <li>Usage data and analytics</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <div className="text-white/80 space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Information Sharing</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and safety</li>
                <li>In connection with a business transfer</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure backup and recovery procedures</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Content Privacy Levels</h2>
            <div className="text-white/80 space-y-4">
              <p>
                Our platform offers three privacy levels for your content:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Public:</strong> Visible to everyone and indexed by search engines</li>
                <li><strong>Unlisted:</strong> Only accessible via direct link</li>
                <li><strong>Private:</strong> Only visible to you when logged in</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We use cookies and similar technologies to enhance your experience on our platform. This includes:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Authentication and session management</li>
                <li>User preferences and settings</li>
                <li>Analytics and performance monitoring</li>
                <li>Advertising (Google AdSense)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Third-Party Services</h2>
            <div className="text-white/80 space-y-4">
              <p>
                Our platform integrates with third-party services:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Google AdSense:</strong> For displaying advertisements</li>
                <li><strong>Email Services:</strong> For sending notifications and verification emails</li>
                <li><strong>Analytics:</strong> For understanding usage patterns</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Your Rights</h2>
            <div className="text-white/80 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your content</li>
                <li>Opt-out of communications</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Data Retention</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We retain your information for as long as your account is active or as needed to provide services. Anonymous content may be subject to automatic deletion based on inactivity.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <div className="text-white/80 space-y-4">
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p>
                Email: privacy@privateonlinenotes.com<br />
                Address: [Your Company Address]
              </p>
            </div>
          </section>
        </GlassCard>
      </div>
    </div>
  );
}
