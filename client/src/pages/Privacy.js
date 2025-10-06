import React from 'react';
import '../styles/pages/Privacy.css'; // Optional: create if needed

const Privacy = () => {
  return (
    <div className="privacy-policy">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to AarogyaCare ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Name, email address, phone number, and contact details</li>
            <li>Date of birth and demographic information</li>
            <li>Medical history, symptoms, and health-related data</li>
            <li>Insurance information and payment details</li>
          </ul>

          <h3>Health Information</h3>
          <ul>
            <li>Medical records, test results, and diagnostic reports</li>
            <li>Appointment details and treatment plans</li>
            <li>Communication with healthcare providers</li>
            <li>Prescription and medication information</li>
          </ul>

          <h3>Technical Information</h3>
          <ul>
            <li>IP address, browser type, and device information</li>
            <li>Usage data and platform interaction logs</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>Provide healthcare services and coordinate patient care</li>
            <li>Schedule appointments and manage medical records</li>
            <li>Process payments and insurance claims</li>
            <li>Communicate with you about your health and appointments</li>
            <li>Improve our services and develop new features</li>
            <li>Comply with legal and regulatory requirements</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>
          <p>We may share your information in the following circumstances:</p>
          <ul>
            <li><strong>Healthcare Providers:</strong> With doctors, nurses, and other authorized medical personnel involved in your care</li>
            <li><strong>Business Partners:</strong> With laboratories, pharmacies, and other healthcare service providers</li>
            <li><strong>Insurance Companies:</strong> For claims processing and verification</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Emergency Situations:</strong> To protect your health or safety</li>
          </ul>
          <p>We do not sell your personal information to third parties for marketing purposes.</p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement robust security measures to protect your information, including:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Access controls and user authentication</li>
            <li>Regular security audits and updates</li>
            <li>Secure data centers and cloud infrastructure</li>
            <li>Employee training on data protection</li>
          </ul>
        </section>

        <section>
          <h2>6. Your Rights and Choices</h2>
          <p>You have the following rights regarding your personal information:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Opt-out:</strong> Opt-out of non-essential communications</li>
          </ul>
          <p>To exercise these rights, please contact us using the information provided below.</p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Medical records are typically retained according to healthcare industry standards and local regulations.
          </p>
        </section>

        <section>
          <h2>8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul>
            <li>Email: aarogyacare55@gmail.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Address: Ahmedabad City</li>
          </ul>
        </section>

        <section>
          <h2>12. Compliance and Certifications</h2>
          <p>
            AarogyaCare is committed to complying with applicable data protection laws, including HIPAA (where applicable), GDPR, and other regional privacy regulations. We regularly review and update our practices to ensure ongoing compliance.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
