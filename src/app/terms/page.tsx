import { GlassCard } from '@/components/ui/glass-card';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-white/70">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <GlassCard className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <div className="text-white/80 space-y-4">
              <p>
                By accessing and using PrivateOnlineNotes (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <div className="text-white/80 space-y-4">
              <p>
                PrivateOnlineNotes is a platform for creating, sharing, and managing markdown documents with various privacy controls. The service includes:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Markdown document creation and editing</li>
                <li>Three privacy levels: Public, Unlisted, and Private</li>
                <li>User account management</li>
                <li>Anonymous posting capabilities</li>
                <li>File management and organization features</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <div className="text-white/80 space-y-4">
              <p>
                To access certain features of the Service, you may be required to create an account. You agree to:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Content Guidelines</h2>
            <div className="text-white/80 space-y-4">
              <p>
                You are responsible for the content you post. You agree not to post content that:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Is illegal, harmful, or violates any laws</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains malware or malicious code</li>
                <li>Is spam or unwanted promotional material</li>
                <li>Harasses or threatens other users</li>
                <li>Contains explicit or inappropriate material</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Privacy and Data</h2>
            <div className="text-white/80 space-y-4">
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
              <p>
                Content Privacy Levels:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Public:</strong> Visible to everyone and may appear in search results</li>
                <li><strong>Unlisted:</strong> Only accessible via direct link</li>
                <li><strong>Private:</strong> Only visible to you when authenticated</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <div className="text-white/80 space-y-4">
              <p>
                You retain ownership of content you create. By posting content, you grant us a non-exclusive license to use, modify, and display your content for the purpose of providing the Service.
              </p>
              <p>
                The Service itself, including its design, features, and underlying technology, is owned by us and protected by intellectual property laws.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibent text-white mb-4">7. Prohibited Uses</h2>
            <div className="text-white/80 space-y-4">
              <p>
                You may not use the Service:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>For any unlawful purpose or in violation of these Terms</li>
                <li>To transmit harmful or malicious software</li>
                <li>To interfere with or disrupt the Service</li>
                <li>To attempt unauthorized access to our systems</li>
                <li>To impersonate another person or entity</li>
                <li>To collect user information without consent</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Service Availability</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We strive to keep the Service available 24/7, but we cannot guarantee uninterrupted access. We may suspend or discontinue the Service at any time for maintenance, updates, or other reasons.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Termination</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.
              </p>
              <p>
                You may terminate your account at any time by contacting us or using the account deletion feature.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Disclaimers and Limitations</h2>
            <div className="text-white/80 space-y-4">
              <p>
                The Service is provided &quot;as is&quot; without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to warranties of merchantability and fitness for a particular purpose.
              </p>
              <p>
                We shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Advertising</h2>
            <div className="text-white/80 space-y-4">
              <p>
                The Service may display advertisements provided by third parties, including Google AdSense. We are not responsible for the content of these advertisements or the practices of advertisers.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
            <div className="text-white/80 space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
            <div className="text-white/80 space-y-4">
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p>
                Email: legal@privateonlinenotes.com<br />
                Address: [Your Company Address]
              </p>
            </div>
          </section>
        </GlassCard>
      </div>
    </div>
  );
}
