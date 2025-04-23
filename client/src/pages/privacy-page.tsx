import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <p>Last updated: April 23, 2025</p>
          
          <h2>1. Introduction</h2>
          <p>
            At GENIQL, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services.
          </p>
          
          <h2>2. Information We Collect</h2>
          <p>
            We may collect the following types of information:
          </p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, and username when you register an account.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website and services.</li>
            <li><strong>Content:</strong> Information you provide when using our services, such as startup ideas, comments, and messages.</li>
            <li><strong>Device Information:</strong> Information about your device, including IP address, browser type, and operating system.</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>
            We use your information for the following purposes:
          </p>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To notify you about changes to our services</li>
            <li>To allow you to participate in interactive features</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our services</li>
            <li>To monitor the usage of our services</li>
            <li>To detect, prevent, and address technical issues</li>
          </ul>
          
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
          
          <h2>5. Third-Party Services</h2>
          <p>
            We may use third-party services to facilitate our service, to provide the service on our behalf, to perform service-related services, or to assist us in analyzing how our service is used. These third parties have access to your personal information only to perform these tasks on our behalf.
          </p>
          
          <h2>6. Data Retention</h2>
          <p>
            We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy.
          </p>
          
          <h2>7. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul>
            <li>The right to access the personal information we hold about you</li>
            <li>The right to request correction of your personal information</li>
            <li>The right to request deletion of your personal information</li>
            <li>The right to restrict processing of your personal information</li>
            <li>The right to data portability</li>
            <li>The right to object to processing of your personal information</li>
          </ul>
          
          <h2>8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
          </p>
          
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@geniql.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}