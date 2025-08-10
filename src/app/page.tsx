import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText, Share, Shield, Code, Globe, Sparkles, Check } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">Notta.in</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm bg-muted">
              <Sparkles className="mr-2 h-4 w-4" />
              Fast, secure, and beautiful note sharing
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Share notes
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                beautifully
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
              Create, edit, and share your notes and code snippets with the world. 
              Perfect for developers, students, and teams who value simplicity.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/anonymous">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Try without signup
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to share
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with modern web technologies for the best experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: "Monaco Editor",
                description: "Professional code editor with syntax highlighting for 100+ languages"
              },
              {
                icon: Share,
                title: "Instant Sharing",
                description: "Generate secure shareable links in seconds with custom expiry options"
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "Your data is encrypted and secure. Anonymous sharing available"
              },
              {
                icon: Globe,
                title: "No Account Required",
                description: "Create and share notes instantly without any registration"
              },
              {
                icon: FileText,
                title: "Rich Formatting",
                description: "Support for markdown, code blocks, and rich text formatting"
              },
              {
                icon: Sparkles,
                title: "Modern Interface",
                description: "Clean, intuitive design that works on all your devices"
              }
            ].map((feature, index) => (
              <div key={index} className="group p-6 rounded-lg border bg-background hover:shadow-md transition-all">
                <feature.icon className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you need more
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-lg border bg-background">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">Perfect for personal use</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited public notes",
                  "Anonymous sharing",
                  "Basic syntax highlighting",
                  "7-day link expiry"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <Button className="w-full">Get Started Free</Button>
              </Link>
            </div>
            
            <div className="p-8 rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">For professionals and teams</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free",
                  "Private notes & folders",
                  "Advanced sharing controls",
                  "Unlimited storage",
                  "Priority support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-600 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <Button className="w-full">View Pricing</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to share your ideas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers, students, and professionals who trust Notta.in
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
            <Link href="/anonymous">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                Try Anonymous Mode
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <span className="font-bold">Notta.in</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Fast, secure, and beautiful note sharing for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/anonymous" className="hover:text-foreground transition-colors">Anonymous Notes</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/auth/register" className="hover:text-foreground transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Notta.in. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">Made with ❤️ for the community</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
