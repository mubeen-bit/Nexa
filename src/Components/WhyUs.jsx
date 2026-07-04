import "./WhyUs.css";
import {
  FaShieldAlt,
  FaUniversity,
  FaComments,
  FaLock,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function WhyUs() {
  const navigate = useNavigate();

  const reasons = [
    {
      icon: <FaShieldAlt />,
      title: "Verified seniors only",
      desc: "Every senior on our platform is verified. No fake profiles, no random advice.",
    },
    {
      icon: <FaUniversity />,
      title: "Same college, real experience",
      desc: "Talk to someone who studied where you study and faced what you're facing.",
    },
    {
      icon: <FaComments />,
      title: "Honest 1:1 conversations",
      desc: "No scripted answers. Just real talk about what worked and what didn't.",
    },
    {
      icon: <FaLock />,
      title: "Safe and private",
      desc: "Your conversations stay between you and your senior. Always.",
    },
  ];

  return (
    <section className="why-wrap">
      <h2 className="why-title">Why SeniorJRTalks?</h2>

      <p className="why-sub">
        We built this because we wished we had it when we were juniors.
      </p>

      <div className="why-grid">
        {reasons.map((r) => (
          <div className="why-card" key={r.title}>
            <div className="why-icon">{r.icon}</div>
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
          </div>
        ))}
      </div>

      {/* CONTACT STRIP */}
      <div className="why-contact">
        <div className="why-contact-text">
          <h3>Have a question?</h3>
          <p>
            We're real people. Reach out directly and we'll get back to you
            within 24 hours.
          </p>
        </div>

        <div className="why-contact-actions">
          <a
            href="https://wa.me/919100479247"
            target="_blank"
            rel="noreferrer"
            className="why-contact-btn whatsapp"
          >
            <FaWhatsapp />
            <span>WhatsApp us</span>
          </a>

          <a
            href="mailto:learnwithmubeen.in@gmail.com"
            className="why-contact-btn email"
          >
            <FaEnvelope />
            <span>Email us</span>
          </a>

          <button
            className="why-contact-btn outline"
            onClick={() => navigate("/contact")}
          >
            View all contact options
          </button>
        </div>
      </div>
    </section>
  );
}
