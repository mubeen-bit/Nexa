import "./WhyUs.css";

export default function WhyUs() {
  const reasons = [
    {
      icon: "✅",
      title: "Verified seniors only",
      desc: "Every senior on our platform is verified. No fake profiles, no random advice.",
    },
    {
      icon: "🎯",
      title: "Same college, real experience",
      desc: "Talk to someone who studied where you study and faced what you're facing.",
    },
    {
      icon: "💬",
      title: "Honest 1:1 conversations",
      desc: "No scripted answers. Just real talk about what worked and what didn't.",
    },
    {
      icon: "🔒",
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
            <span className="why-icon">{r.icon}</span>
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
