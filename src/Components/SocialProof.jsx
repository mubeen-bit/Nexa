import "./SocialProof.css";

export default function SocialProof() {
  const stories = [
    {
      name: "Rahul M.",
      college: "VIT Vellore",
      text: "I had no idea how placements worked at my college. One session with my senior cleared everything. Got my first internship 2 months later.",
      placed: "Interned at TCS",
    },
    {
      name: "Priya S.",
      college: "MIT Manipal",
      text: "I was about to drop my CS major because I thought I wasn't good enough. My senior told me exactly what to focus on. Changed everything.",
      placed: "Now at Google",
    },
    {
      name: "Arjun K.",
      college: "BITS Pilani",
      text: "No one tells you the real story about college. My senior did. Saved me a year of going in the wrong direction.",
      placed: "Placed at Razorpay",
    },
  ];

  return (
    <section className="sp-wrap">
      <h2 className="sp-title">Real students. Real results.</h2>
      <p className="sp-sub">
        Here's what juniors say after talking to their seniors.
      </p>
      <div className="sp-grid">
        {stories.map((s) => (
          <div className="sp-card" key={s.name}>
            <p className="sp-text">"{s.text}"</p>
            <div className="sp-footer">
              <div className="sp-avatar">{s.name.charAt(0)}</div>
              <div>
                <p className="sp-name">{s.name}</p>
                <p className="sp-college">
                  {s.college} · {s.placed}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
