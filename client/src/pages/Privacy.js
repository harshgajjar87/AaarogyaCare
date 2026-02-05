import React from 'react';

const Privacy = () => {
  const Section = ({ title, children }) => (
    <section className="mb-8">
      <h2 className="text-2xl font-bold text-health-text-h mb-4 border-b pb-2">{title}</h2>
      <div className="space-y-4 text-health-text-p">{children}</div>
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-health-text-h">Privacy Policy</h1>
        <p className="text-slate-500 mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Section title="1. Introduction">
        <p>
          Welcome to AarogyaCare ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our healthcare platform.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <h3 className="text-xl font-semibold text-health-text-h mb-2">Personal Information</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Name, email address, phone number, and contact details</li>
          <li>Date of birth and demographic information</li>
          <li>Medical history, symptoms, and health-related data</li>
          <li>Insurance information and payment details</li>
        </ul>

        <h3 className="text-xl font-semibold text-health-text-h mt-4 mb-2">Health Information</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Medical records, test results, and diagnostic reports</li>
          <li>Appointment details and treatment plans</li>
          <li>Communication with healthcare providers</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <ul className="list-disc list-inside space-y-1">
          <li>Provide healthcare services and coordinate patient care</li>
          <li>Schedule appointments and manage medical records</li>
          <li>Process payments and insurance claims</li>
          <li>Communicate with you about your health and appointments</li>
          <li>Improve our services and develop new features</li>
          <li>Comply with legal and regulatory requirements</li>
        </ul>
      </Section>

      <Section title="4. Information Sharing">
        <p>We may share your information in the following circumstances:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Healthcare Providers:</strong> With doctors and other authorized medical personnel involved in your care.</li>
          <li><strong>Business Partners:</strong> With laboratories, pharmacies, and other healthcare service providers.</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
        </ul>
        <p>We do not sell your personal information to third parties.</p>
      </Section>

      <Section title="5. Data Security">
        <p>We implement robust security measures to protect your information, including encryption, access controls, and regular security audits.</p>
      </Section>

      <Section title="6. Your Rights">
        <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us.</p>
      </Section>
      
      <Section title="11. Contact Us">
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
          <a href="mailto:aarogyacare55@gmail.com" className="text-health-primary hover:underline ml-1">aarogyacare55@gmail.com</a>
        </p>
      </Section>
    </div>
  );
};

export default Privacy;
