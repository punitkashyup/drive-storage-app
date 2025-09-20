import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HardDrive, ArrowLeft, Shield, Eye, Lock } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-semibold text-gray-900">Bucket</span>
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
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-gray-600 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <h3 className="font-medium">1.1 Authentication Information</h3>
                <p>When you sign in with Google, we receive:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Your Google account email address</li>
                  <li>Your profile name and profile picture</li>
                  <li>OAuth tokens for accessing your Google Drive</li>
                </ul>

                <h3 className="font-medium mt-4">1.2 File Metadata</h3>
                <p>We access metadata about your files to display them in the interface:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>File names, sizes, and modification dates</li>
                  <li>File types and MIME types</li>
                  <li>Folder structure and organization</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. What We Do NOT Collect</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="font-medium text-green-700 mb-2">We are committed to minimal data collection:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>We do not store copies of your files on our servers</li>
                  <li>We do not track your browsing behavior outside our app</li>
                  <li>We do not sell or share your data with third parties</li>
                  <li>We do not use your data for advertising purposes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>We use the collected information solely to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Authenticate your identity and maintain your session</li>
                  <li>Display your files and folders in the web interface</li>
                  <li>Enable file operations (upload, download, rename, delete)</li>
                  <li>Provide customer support when requested</li>
                  <li>Improve the functionality and user experience of our service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Google Drive Integration</h2>
              <div className="text-gray-700 leading-relaxed space-y-3">
                <p>Our service integrates with Google Drive using official Google APIs:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All file operations are performed directly on your Google Drive account</li>
                  <li>We use OAuth 2.0 for secure authentication with Google</li>
                  <li>Your files never leave Google's servers</li>
                  <li>Google's own privacy policies also apply to your data</li>
                </ul>
                <p className="text-sm bg-gray-100 p-3 rounded-lg mt-3">
                  <strong>Note:</strong> Please review{" "}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    Google's Privacy Policy
                  </a>{" "}
                  to understand how Google handles your data.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>We implement industry-standard security measures:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>All data transmission is encrypted using HTTPS/TLS</li>
                  <li>OAuth tokens are securely stored and regularly refreshed</li>
                  <li>We use secure session management with HTTP-only cookies</li>
                  <li>Our application follows OWASP security best practices</li>
                  <li>Regular security updates and monitoring</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Retention</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>We follow a minimal data retention policy:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Session data is deleted when you log out or after expiration</li>
                  <li>We do not maintain long-term logs of your file activities</li>
                  <li>OAuth tokens are only kept for the duration of your session</li>
                  <li>No personal data is retained after you disconnect our app from your Google account</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights and Controls</h2>
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>You have full control over your data:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>You can revoke our app's access at any time through your Google account settings</li>
                  <li>You can delete your files directly through our interface or Google Drive</li>
                  <li>You can request information about what data we have about you</li>
                  <li>You can log out to end your session at any time</li>
                </ul>
                <p className="text-sm bg-gray-100 p-3 rounded-lg mt-3">
                  <strong>To revoke access:</strong> Visit{" "}
                  <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline">
                    Google Account Permissions
                  </a>{" "}
                  and remove "Bucket" from the list.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Third-Party Services</h2>
              <div className="text-gray-700 leading-relaxed">
                <p>Our application integrates with:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Google Drive API:</strong> For file management functionality</li>
                  <li><strong>Google OAuth 2.0:</strong> For secure authentication</li>
                  <li><strong>Hosting Provider:</strong> For application deployment (varies by deployment)</li>
                </ul>
                <p className="mt-3">
                  These services have their own privacy policies that also apply to your use of our application.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will notify users of any material changes by posting the new policy on this page with an updated "Last updated" date. Your continued use of the service after changes constitutes acceptance of the new policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
              <div className="text-gray-700 leading-relaxed">
                <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Through our support channels</li>
                  <li>By creating an issue on our GitHub repository</li>
                  <li>Via the contact information provided in our application</li>
                </ul>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>© 2024 Bucket. All rights reserved.</p>
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