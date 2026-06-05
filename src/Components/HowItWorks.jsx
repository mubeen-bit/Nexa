import "./HowItWorks.css";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Find your senior",
      desc: "Search by college and find a senior who's already been through what you're facing.",
    },
    {
      number: "02",
      title: "Book a slot",
      desc: "Pick a time that works for you and book a 1:1 session in seconds.",
    },
    {
      number: "03",
      title: "Get real answers",
      desc: "Talk openly about placements, college life, and everything in between.",
    },
  ];

  return (
    <section className="hiw-wrap">
      <h2 className="hiw-title">How it works</h2>
      <p className="hiw-sub">Three steps to get the guidance you need.</p>
      <div className="hiw-steps">
        {steps.map((step) => (
          <div className="hiw-step" key={step.number}>
            <span className="hiw-number">{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
