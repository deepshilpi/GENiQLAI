import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <p>Last updated: April 23, 2025</p>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to GENIQL ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the GENIQL website, applications, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
          </p>
          
          <h2>2. Service Description</h2>
          <p>
            GENIQL is an AI-powered startup analysis platform that provides data-driven insights for entrepreneurs. Our Services include startup idea analysis, market assessment, and community features.
          </p>
          
          <h2>3. User Accounts</h2>
          <p>
            To access certain features of our Services, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          
          <h2>4. User Content</h2>
          <p>
            You retain ownership of any content you submit through our Services. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content.
          </p>
          
          <h2>5. Acceptable Use</h2>
          <p>
            You agree not to use the Services to:
          </p>
          <ul>
            <li>Violate any applicable law or regulation</li>
            <li>Infringe on the rights of others</li>
            <li>Submit false or misleading information</li>
            <li>Distribute malware or engage in any activity that could harm our Services</li>
            <li>Attempt to gain unauthorized access to our systems</li>
          </ul>
          
          <h2>6. Intellectual Property</h2>
          <p>
            The Services and all related content, features, and functionality are owned by GENIQL and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          
          <h2>7. Disclaimer of Warranties</h2>
          <p>
            THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
          </p>
          
          <h2>8. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, GENIQL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
          </p>
          
          <h2>9. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will provide notice of any material changes. Your continued use of the Services after such modifications will constitute your acknowledgment of the modified Terms.
          </p>
          
          <h2>10. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at legal@geniql.com.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}