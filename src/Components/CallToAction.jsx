import "./CallToAction.css";

export default function CallToAction() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="cta-wrap">
      <h2>Stop guessing. Start asking.</h2>
      <p>
        Your senior has already figured out what you're struggling with right
        now. Book a session and get the answers you actually need.
      </p>
      <button className="cta-btn" onClick={scrollToTop}>
        Find your senior →
      </button>
    </section>
  );
}
