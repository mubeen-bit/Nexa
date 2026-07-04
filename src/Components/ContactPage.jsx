import "./ContactPage.css";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";

export default function ContactPage() {
  return (
    <>
      <Header />

      <div className="contact-wrap">
        {/* HERO */}
        <div className="contact-hero">
          <h1>We're here to help</h1>
          <p>
            Whether you're a junior with questions or a senior wanting to join —
            reach out and we'll get back to you within 24 hours.
          </p>
        </div>

        {/* CONTACT CARDS */}
        <div className="contact-grid">
          {/* Email */}
          <a
            href="mailto:learnwithmubeen.in@gmail.com"
            className="contact-card"
          >
            <div className="contact-card-icon email-icon">
              <FaEnvelope />
            </div>

            <h3>Email us</h3>
            <p>For general queries, partnerships, or feedback.</p>

            <span className="contact-card-link">
              learnwithmubeen.in@gmail.com
            </span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/919100479247"
            target="_blank"
            rel="noreferrer"
            className="contact-card"
          >
            <div className="contact-card-icon whatsapp-icon">
              <FaWhatsapp />
            </div>

            <h3>WhatsApp us</h3>
            <p>Quick questions? Message us directly on WhatsApp.</p>

            <span className="contact-card-link">+91 91004 79247</span>
          </a>
        </div>

        {/* TRUST SECTION */}
        <div className="contact-trust">
          <h2>Why reach out?</h2>

          <div className="contact-trust-grid">
            <div className="contact-trust-item">
              <span>⚡</span>
              <h4>Fast responses</h4>
              <p>We reply within 24 hours on all channels.</p>
            </div>

            <div className="contact-trust-item">
              <span>🎓</span>
              <h4>Senior onboarding</h4>
              <p>
                Want to join as a senior mentor? We'll guide you through the
                process.
              </p>
            </div>

            <div className="contact-trust-item">
              <span>🔒</span>
              <h4>Safe and private</h4>
              <p>Your details are never shared with third parties.</p>
            </div>

            <div className="contact-trust-item">
              <span>💬</span>
              <h4>Real people</h4>
              <p>No bots, no automated replies. You talk to us directly.</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="contact-faq">
          <h2>Common questions</h2>

          <div className="contact-faq-list">
            <div className="contact-faq-item">
              <h4>How do I become a senior mentor?</h4>
              <p>
                Click <strong>Become a Senior</strong> in the navigation, fill
                out the application form, and we'll review it within 24 hours.
              </p>
            </div>

            <div className="contact-faq-item">
              <h4>Is my payment secure?</h4>
              <p>
                Yes — all payments are processed through Razorpay, a PCI-DSS
                compliant payment gateway used by thousands of Indian
                businesses.
              </p>
            </div>

            <div className="contact-faq-item">
              <h4>What if my senior doesn't show up?</h4>
              <p>
                Contact us immediately on WhatsApp and we'll arrange a refund or
                reschedule within 24 hours.
              </p>
            </div>

            <div className="contact-faq-item">
              <h4>Can I get a refund?</h4>
              <p>
                If a session is cancelled or the senior doesn't attend, we offer
                a full refund. Reach out to us via email or WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
