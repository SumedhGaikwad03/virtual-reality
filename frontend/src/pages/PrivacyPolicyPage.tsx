/*
 * PURPOSE:
 * Public Privacy Policy page for the Virtual Reality real-estate platform.
 *
 * FLOW:
 * AppRouter -> Route /privacy-policy -> PrivacyPolicyPage -> Comprehensive editorial privacy statement.
 *
 * RESPONSIBILITY:
 * Outlines personal data collection, usage, sharing, security, user privacy rights,
 * push notification distinction, cookie/storage practices, and data retention specifically
 * for Virtual Reality, using verified contact channels and conforming to the
 * "Modern. Refined. Human." visual language.
 */

import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../components/home/hooks/useSite";

export function PrivacyPolicyPage() {
  const { site } = useSite();

  // Set document title, meta description, and canonical link
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Privacy Policy | Virtual Reality";

    const descMeta = document.querySelector('meta[name="description"]');
    const prevDesc = descMeta?.getAttribute("content");
    if (descMeta) {
      descMeta.setAttribute(
        "content",
        "Privacy policy for Virtual Reality real-estate platform outlining data collection, processing, user rights, and protection practices.",
      );
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    let createdCanonical = false;
    const prevCanonical = canonical?.href;

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
      createdCanonical = true;
    }
    canonical.href = "https://www.virtual2reality.in/privacy-policy";

    window.scrollTo(0, 0);

    return () => {
      document.title = prevTitle || "Virtual Reality";
      if (descMeta && prevDesc) {
        descMeta.setAttribute("content", prevDesc);
      }
      if (canonical) {
        if (createdCanonical) {
          canonical.remove();
        } else if (prevCanonical) {
          canonical.href = prevCanonical;
        }
      }
    };
  }, []);

  const contact = site?.contact;
  const companyName = site?.name || "Virtual Reality";
  const contactPhone = contact?.phone || "+91 89996 43665";
  const contactEmail = contact?.email || "dipankarjagtap@virtual2reality.in";
  const contactAddress =
    contact?.address ||
    "Office No. 202, 2nd Floor, Mspace Mall, Near Mahindra Antheia, Pimpri, Pune 411018";

  return (
    <div className="privacy-policy-page-container">
      {/* Header / Breadcrumb */}
      <header className="privacy-policy-header">
        <div className="privacy-policy-breadcrumb">
          <Link to="/" className="privacy-breadcrumb-link">
            ← Back to Home
          </Link>
        </div>
        <span className="section-eyebrow">LEGAL & PRIVACY TRANSPARENCY</span>
        <h1 className="privacy-policy-title">Privacy Policy</h1>
        <p className="privacy-policy-meta">
          <strong>Effective Date:</strong> September 5, 2026 &nbsp;|&nbsp; <strong>Last Updated:</strong> September 2026
        </p>
      </header>

      {/* Main Privacy Document Content */}
      <article className="privacy-policy-article">
        {/* 1. Introduction */}
        <section className="privacy-policy-section">
          <h2>1. Introduction</h2>
          <p>
            Welcome to <strong>{companyName}</strong> ("we," "our," or "us"). We operate the real-estate discovery
            and advisory platform accessible at{" "}
            <a href="https://www.virtual2reality.in" className="privacy-inline-link">
              https://www.virtual2reality.in
            </a>
            . Our platform is dedicated to showcasing prime residential developments, boutique luxury towers, and private villas
            in Pune, connecting homebuyers with verified architectural projects and consultative property guidance.
          </p>
          <p>
            We respect your privacy and are committed to transparency in how personal data is collected, used, and safeguarded.
            This Privacy Policy explains our data practices when you visit our website, browse properties and developers,
            submit enquiry or consultation requests, or communicate with our advisory desk.
          </p>
        </section>

        {/* 2. Scope */}
        <section className="privacy-policy-section">
          <h2>2. Scope</h2>
          <p>
            This Privacy Policy applies to all users, visitors, and prospective buyers who access our public digital services, including:
          </p>
          <ul>
            <li>The public website accessible via desktop and mobile browsers.</li>
            <li>Our Progressive Web Application (PWA) on mobile devices.</li>
            <li>Property search, filter, and discovery advisor features.</li>
            <li>Online enquiry, callback, and consultation request forms.</li>
            <li>Direct advisory communications initiated through the platform (such as telephone or email inquiries).</li>
          </ul>
          <p>
            This policy does not apply to external websites, third-party developer portals, or services linked from our platform.
            We encourage you to review the privacy notices of any third-party websites you visit.
          </p>
        </section>

        {/* 3. Information We Collect */}
        <section className="privacy-policy-section">
          <h2>3. Information We Collect</h2>
          <p>We collect only the personal information that is reasonably necessary to fulfill your real-estate inquiries and provide consultative services:</p>
          <ul>
            <li>
              <strong>Identity & Contact Information:</strong> Your full name, telephone/mobile number, and email address when you voluntarily submit
              an advisory consultation form, schedule a site visit, or request floor plans and pricing brochures.
            </li>
            <li>
              <strong>Property Preference Information:</strong> Preferred configurations (e.g., 3 BHK, 4 BHK, Villa), target locations across Pune
              (e.g., Baner, Bavdhan, Koregaon Park), budget preferences, timeline, and specific requirements or questions you submit in free-text fields.
            </li>
            <li>
              <strong>Communication Records:</strong> Records of your communications with our advisory desk, including questions, feedback, or notes
              submitted through website forms or direct email/telephone correspondence.
            </li>
            <li>
              <strong>Technical & Operational Information:</strong> Basic technical information generated during standard web browsing, such as IP address,
              browser type, operating system version, timestamp, and referring URL, collected automatically for server uptime, security monitoring, and responsive layout presentation.
            </li>
          </ul>
          <div className="privacy-highlight-box">
            <strong>Explicit Non-Collection Statement:</strong> Virtual Reality does NOT collect sensitive personal information such as financial account credentials,
            bank details, credit/debit card numbers, biometric data, health information, government identification numbers (Aadhaar/PAN), or precise GPS geolocation.
          </div>
        </section>

        {/* 4. How We Collect Information */}
        <section className="privacy-policy-section">
          <h2>4. How We Collect Information</h2>
          <p>We collect personal information through the following direct and automated mechanisms:</p>
          <ul>
            <li>
              <strong>Direct Form Submissions:</strong> When you complete our homepage Consultation & Advisory form, project-specific enquiry forms, or configuration callback requests.
            </li>
            <li>
              <strong>Guided Property Discovery:</strong> When you select preference filters (such as BHK or location) within our property discovery advisor (Tara) interface.
            </li>
            <li>
              <strong>Direct Inquiries:</strong> When you contact our team directly via telephone, email, or physical office visit.
            </li>
            <li>
              <strong>External Communication Links (e.g., WhatsApp):</strong> When you click the WhatsApp link to chat with our advisory desk, you are redirected to WhatsApp's external service.
              Information submitted directly within WhatsApp is subject to WhatsApp's own privacy terms; Virtual Reality only receives the messages you choose to send to us.
            </li>
            <li>
              <strong>Automated Operational Logs:</strong> Standard HTTP server logs recorded during normal browser interactions for security and system stability.
            </li>
          </ul>
        </section>

        {/* 5. Why We Use Personal Information */}
        <section className="privacy-policy-section">
          <h2>5. Why We Use Personal Information</h2>
          <p>We process your personal information strictly for legitimate real-estate advisory and customer support purposes, including:</p>
          <ul>
            <li>
              <strong>Responding to Property Inquiries:</strong> Contacting you to provide verified details, carpet areas, pricing breakdowns, and developer credentials for projects you requested.
            </li>
            <li>
              <strong>Facilitating Site Visits & Consultations:</strong> Coordinating private site visits and architectural consultations with authorized partner developers upon your request.
            </li>
            <li>
              <strong>Understanding Property Preferences:</strong> Matching your stated housing criteria with relevant, verified residential inventory across Pune.
            </li>
            <li>
              <strong>Platform Security & Operation:</strong> Monitoring system uptime, preventing spam or fraudulent submissions, and ensuring platform integrity.
            </li>
            <li>
              <strong>Legal Compliance:</strong> Complying with applicable Indian laws, real-estate regulatory frameworks (such as RERA guidelines where relevant), and lawful official requests.
            </li>
          </ul>
        </section>

        {/* 6. Legal Basis / Lawful Processing */}
        <section className="privacy-policy-section">
          <h2>6. Legal Basis & Lawful Processing</h2>
          <p>Subject to applicable law, our processing of personal data is grounded in the following lawful bases:</p>
          <ul>
            <li>
              <strong>User Consent:</strong> Where you voluntarily provide your details to request consultations, brochures, or property updates.
            </li>
            <li>
              <strong>Pre-Contractual Steps:</strong> Taking steps at your direct request prior to entering into a property transaction (such as arranging builder consultations or site appointments).
            </li>
            <li>
              <strong>Legitimate Business Interests:</strong> Maintaining platform functionality, preventing fraudulent activity, and providing professional real-estate advisory services.
            </li>
            <li>
              <strong>Legal Obligations:</strong> Fulfilling statutory and regulatory compliance requirements under applicable laws.
            </li>
          </ul>
        </section>

        {/* 7. Sharing and Disclosure of Information */}
        <section className="privacy-policy-section">
          <h2>7. Sharing and Disclosure of Information</h2>
          <p>
            <strong>We do not sell, rent, or trade your personal information</strong> to third-party data brokers, telemarketing companies, or unrelated advertising lists.
          </p>
          <p>We disclose personal data only under the following defined circumstances:</p>
          <ul>
            <li>
              <strong>Authorized Partner Developers:</strong> When you express interest in a specific project or request a site visit, your contact details and specified preferences are shared with the verified development partner’s sales desk solely to facilitate your requested inquiry.
            </li>
            <li>
              <strong>Infrastructure Service Providers:</strong> Trusted technical partners providing database hosting, cloud compute infrastructure, and media delivery under strict confidentiality and security terms.
            </li>
            <li>
              <strong>Legal & Regulatory Authorities:</strong> Where required by law, court order, or official government authority to comply with legal obligations or protect lawful rights and public safety.
            </li>
          </ul>
        </section>

        {/* 8. Third-Party Services */}
        <section className="privacy-policy-section">
          <h2>8. Third-Party Infrastructure Services</h2>
          <p>
            To deliver a reliable digital experience, our application utilizes select high-reputation cloud infrastructure providers:
          </p>
          <ul>
            <li>
              <strong>Cloud Hosting & Database:</strong> Secure application hosting and managed PostgreSQL database infrastructure.
            </li>
            <li>
              <strong>Media Delivery (CDN):</strong> Cloudinary CDN services for delivering optimized architectural photography and project floor plans.
            </li>
            <li>
              <strong>Communication Infrastructure:</strong> Standard web communication protocols and direct telephony/email channels.
            </li>
          </ul>
          <p>
            These infrastructure providers process technical data strictly on our behalf under contractual security safeguards and are prohibited from using personal information for independent commercial purposes.
          </p>
        </section>

        {/* 9. Cookies and Local Storage */}
        <section className="privacy-policy-section">
          <h2>9. Cookies and Browser Storage</h2>
          <p>
            Our website uses minimal, functional browser storage (such as session storage and local storage) strictly for essential user experience operations,
            including preserving filter selections during property discovery, remembering dismissed announcement bubbles, and maintaining application stability.
          </p>
          <p>
            <strong>Internal Admin Authentication Distinction:</strong> Authenticated administrative staff utilize secure session tokens stored locally strictly for authorized administrative login.
            This authentication mechanism is not used to track general public visitors.
          </p>
          <p>
            We do not use third-party tracking cookies or behavioral advertising cookies across external websites.
          </p>
        </section>

        {/* 10. Push Notifications */}
        <section className="privacy-policy-section">
          <h2>10. Push Notifications</h2>
          <p>
            Our Progressive Web Application (PWA) includes Web Push notification functionality designed strictly for internal administrative notifications (such as alerting authorized firm advisors of incoming client inquiries).
          </p>
          <p>
            We do not send unsolicited commercial marketing push notifications to general public website visitors without explicit opt-in browser permission.
          </p>
        </section>

        {/* 11. Data Security */}
        <section className="privacy-policy-section">
          <h2>11. Data Security Measures</h2>
          <p>
            We take reasonable technical and organizational measures to protect personal data from unauthorized access, loss, misuse, or alteration. These measures include:
          </p>
          <ul>
            <li>Encrypted HTTPS/TLS connections for all web traffic in transit.</li>
            <li>Role-based access controls restricting administrative lead access to authorized team members.</li>
            <li>Secure credential handling using industry-standard hashing algorithms for administrative accounts.</li>
            <li>Controlled database access with strict environment isolation.</li>
          </ul>
          <p>
            While we implement diligent security practices, no method of electronic transmission or storage is completely immune to potential security events. We continuously review our security posture.
          </p>
        </section>

        {/* 12. Data Retention */}
        <section className="privacy-policy-section">
          <h2>12. Data Retention</h2>
          <p>
            We retain personal information only for as long as reasonably necessary to fulfill the purposes for which it was collected, including responding to ongoing real-estate advisory requests,
            resolving client inquiries, maintaining operational audit logs, and meeting statutory legal or regulatory retention obligations.
          </p>
          <p>
            When personal information is no longer needed, it is securely deleted, anonymized, or isolated from further active processing in accordance with our data disposal practices.
          </p>
        </section>

        {/* 13. Your Privacy Rights */}
        <section className="privacy-policy-section">
          <h2>13. Your Privacy Rights</h2>
          <p>Subject to applicable data protection laws, you may exercise the following rights regarding your personal information:</p>
          <ul>
            <li>
              <strong>Right to Access:</strong> You may request confirmation of whether we hold your personal information and obtain details on how it is processed.
            </li>
            <li>
              <strong>Right to Rectification:</strong> You may request correction of inaccurate, outdated, or incomplete personal details.
            </li>
            <li>
              <strong>Right to Erasure:</strong> You may request the deletion of your personal contact records, subject to ongoing legal or regulatory compliance requirements.
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Where processing is based on your consent, you may withdraw your consent at any time for future communications.
            </li>
            <li>
              <strong>Right to Inquire:</strong> You may contact our advisory desk at any time with questions or concerns regarding our privacy practices.
            </li>
          </ul>
        </section>

        {/* 14. Marketing & Promotional Communications */}
        <section className="privacy-policy-section">
          <h2>14. Marketing & Direct Communications</h2>
          <p>
            We communicate with you primarily to respond to your explicit property inquiries and consultation requests. We do not conduct automated bulk spam campaigns.
          </p>
          <p>
            If you ever wish to stop receiving advisory updates or follow-up communications regarding a property inquiry, you may notify us via email or telephone, and we will promptly update your preferences.
          </p>
        </section>

        {/* 15. International Data Transfers */}
        <section className="privacy-policy-section">
          <h2>15. International Data Transfers</h2>
          <p>
            Virtual Reality operates in Pune, Maharashtra, India. In delivering our digital platform, certain technical services (such as cloud hosting, database management, and media delivery)
            may be hosted on secure servers operated by global infrastructure providers adhering to standard data protection safeguards.
          </p>
        </section>

        {/* 16. Children's Privacy */}
        <section className="privacy-policy-section">
          <h2>16. Children's Privacy</h2>
          <p>
            Our platform is designed for general audiences interested in residential real-estate and is not directed at children under the age of majority.
            We do not knowingly collect personal information from children.
          </p>
        </section>

        {/* 17. Changes to This Privacy Policy */}
        <section className="privacy-policy-section">
          <h2>17. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy periodically to reflect platform improvements, operational practices, or legal updates.
            Any revisions will be published directly on this page with an updated "Effective Date." We encourage you to review this policy periodically.
          </p>
        </section>

        {/* 18. Contact Information */}
        <section className="privacy-policy-section privacy-policy-contact-card">
          <h2>18. Contact Information</h2>
          <p>
            If you have questions, feedback, or requests regarding this Privacy Policy or the handling of your personal data, please contact our firm:
          </p>
          <div className="privacy-contact-details">
            <p>
              <strong>Firm Name:</strong> {companyName}
            </p>
            <p>
              <strong>Direct Phone:</strong>{" "}
              <a href={`tel:${contactPhone.replace(/\s+/g, "")}`} className="privacy-inline-link">
                {contactPhone}
              </a>
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${contactEmail}`} className="privacy-inline-link">
                {contactEmail}
              </a>
            </p>
            <p>
              <strong>Office Location:</strong> {contactAddress}
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}
