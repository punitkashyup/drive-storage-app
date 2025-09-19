import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HardDrive, ArrowLeft } from "lucide-react"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Drive Storage</span>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Drive Storage (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Service Description</h2>
              <p className="text-gray-700 leading-relaxed">
                Drive Storage is a web application that provides file management capabilities integrated with Google Drive. The service allows users to upload, organize, view, and manage their files stored in their personal Google Drive account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Responsibilities</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>By using our service, you agree to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Use the service only for lawful purposes</li>
                  <li>Not upload or share any illegal, harmful, or offensive content</li>
                  <li>Respect the intellectual property rights of others</li>
                  <li>Keep your account credentials secure</li>
                  <li>Not attempt to gain unauthorized access to the service or other users' accounts</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Google Drive Integration</h2>
              <p className="text-gray-700 leading-relaxed">
                This service integrates with Google Drive through Google&apos;s official APIs. Your files remain stored in your personal Google Drive account. We do not store your files on our servers. By using this service, you also agree to Google&apos;s Terms of Service and Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                We respect your privacy and are committed to protecting your personal data. Please review our{" "}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>{" "}
                to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Service Availability</h2>
              <p className="text-gray-700 leading-relaxed">
                We strive to maintain service availability, but we do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues. We are not liable for any damages resulting from service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                The service is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason, including breach of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our support channels or create an issue on our GitHub repository.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>© 2024 Drive Storage. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}