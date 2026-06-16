import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import LoginButton from "./LoginButton";
import { useNavigate } from "react-router-dom";
import "./SeniorApply.css";

const FORM_STORAGE_KEY = "seniorApplyDraft";

const emptyForm = {
  name: "",
  college: "",
  college_email: "",
  linkedin: "",
  year: "",
  company: "",
  title: "",
  description: "",
  help_with: "",
  price: "",
  duration: "",
  tag: "",
};

export default function SeniorApply() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [existingApplication, setExistingApplication] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  // Show the login prompt inline (instead of replacing the whole form)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();

  // On mount: restore any saved draft, then resolve auth
  useEffect(() => {
    const savedDraft = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedDraft) {
      try {
        setForm(JSON.parse(savedDraft));
      } catch {
        // ignore malformed saved data
      }
    }

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Clear the draft once we know the user is logged in
        localStorage.removeItem(FORM_STORAGE_KEY);

        const { data } = await supabase
          .from("senior_applications")
          .select("status, created_at")
          .eq("user_id", user.id)
          .single();

        if (data) setExistingApplication(data);
      }

      setCheckingAuth(false);
    };

    getUser();

    // Listen for auth state changes — fires when the user completes Google OAuth
    // and the tab/window regains focus with a valid session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setShowLoginPrompt(false);
        localStorage.removeItem(FORM_STORAGE_KEY);

        const { data } = await supabase
          .from("senior_applications")
          .select("status, created_at")
          .eq("user_id", session.user.id)
          .single();

        if (data) setExistingApplication(data);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.college ||
      !form.college_email ||
      !form.linkedin ||
      !form.year ||
      !form.description ||
      !form.help_with ||
      !form.price
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (
      !form.college_email.includes(".ac.in") &&
      !form.college_email.includes(".edu")
    ) {
      alert("Please enter a valid college email (.ac.in or .edu)");
      return;
    }

    // Not logged in yet — save draft and prompt for login
    if (!user) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
      setShowLoginPrompt(true);
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("senior_applications").insert({
      user_id: user.id,
      email: user.email,
      avatar_url: user.user_metadata.avatar_url,
      ...form,
      price: Number(form.price),
    });

    if (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Notify admin
    await fetch(`${import.meta.env.VITE_API_URL}/api/notify/new-application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        college: form.college,
        college_email: form.college_email,
        linkedin: form.linkedin,
        year: form.year,
        company: form.company,
        title: form.title,
        help_with: form.help_with,
        email: user.email,
      }),
    });

    setSubmitted(true);
    setLoading(false);
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (checkingAuth) {
    return (
      <div className="sa-wrap">
        <p className="sa-loading">Loading...</p>
      </div>
    );
  }

  // ── Already applied ──────────────────────────────────────────────────────
  if (existingApplication) {
    return (
      <div className="sa-wrap">
        <div className="sa-card">
          <div className="sa-success">
            <span>
              {existingApplication.status === "approved"
                ? "✓"
                : existingApplication.status === "rejected"
                  ? "✕"
                  : "⏳"}
            </span>
            <h2>
              {existingApplication.status === "approved"
                ? "You're approved!"
                : existingApplication.status === "rejected"
                  ? "Application not approved"
                  : "Application under review"}
            </h2>
            <p>
              {existingApplication.status === "approved"
                ? "You can now access your Senior Dashboard to add your availability."
                : existingApplication.status === "rejected"
                  ? "Unfortunately your application was not approved. Contact us at hello@seniorjrtalks.com for more info."
                  : "We'll review your profile and get back to you within 24 hours."}
            </p>
            {existingApplication.status === "approved" && (
              <button
                className="sa-btn"
                onClick={() => navigate("/senior-dashboard")}
              >
                Go to Senior Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Just submitted ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="sa-wrap">
        <div className="sa-card">
          <div className="sa-success">
            <span>✓</span>
            <h2>Application submitted!</h2>
            <p>
              We'll review your profile and get back to you within 24 hours on{" "}
              <strong>{form.college_email}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="sa-wrap">
      <div className="sa-card">
        <h1 className="sa-title">Become a senior mentor</h1>
        <p className="sa-sub">
          Share your experience and help juniors from your college succeed.
        </p>

        {/* Inline login prompt — shown after "Submit" is clicked without auth */}
        {showLoginPrompt && (
          <div className="sa-login-banner">
            <span>🔒</span>
            <div>
              <strong>One last step — sign in to submit</strong>
              <p>
                Your answers are saved. Sign in with Google and your form will
                be ready to submit right away.
              </p>
            </div>
            <LoginButton />
          </div>
        )}

        <div className="sa-form">
          <div className="sa-field">
            <label>Full name *</label>
            <input
              name="name"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="sa-field">
            <label>College *</label>
            <input
              name="college"
              placeholder="e.g. VIT Vellore"
              value={form.college}
              onChange={handleChange}
            />
          </div>

          <div className="sa-row">
            <div className="sa-field">
              <label>College email *</label>
              <input
                name="college_email"
                type="email"
                placeholder="you@vitstudent.ac.in"
                value={form.college_email}
                onChange={handleChange}
              />
            </div>

            <div className="sa-field">
              <label>Year of study *</label>
              <select name="year" value={form.year} onChange={handleChange}>
                <option value="">Select year</option>
                <option value="2nd year">2nd year</option>
                <option value="3rd year">3rd year</option>
                <option value="4th year">4th year</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="sa-field">
            <label>LinkedIn profile URL *</label>
            <input
              name="linkedin"
              placeholder="https://linkedin.com/in/yourprofile"
              value={form.linkedin}
              onChange={handleChange}
            />
          </div>

          <div className="sa-field">
            <label>Current company / internship</label>
            <input
              name="company"
              placeholder="e.g. Google, TCS, Razorpay (leave blank if none)"
              value={form.company}
              onChange={handleChange}
            />
          </div>

          <div className="sa-field">
            <label>Your title / role</label>
            <input
              name="title"
              placeholder="e.g. Final year CSE student at VIT"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="sa-field">
            <label>About you *</label>
            <textarea
              name="description"
              placeholder="Tell juniors about yourself and your experience..."
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="sa-field">
            <label>What can you help juniors with? *</label>
            <textarea
              name="help_with"
              placeholder="e.g. Placement prep, resume building, internship hunting, college life advice..."
              value={form.help_with}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="sa-row">
            <div className="sa-field">
              <label>Session price (₹) *</label>
              <input
                name="price"
                type="number"
                placeholder="e.g. 99"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="sa-field">
              <label>Session duration</label>
              <input
                name="duration"
                placeholder="e.g. 30 mins"
                value={form.duration}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="sa-field">
            <label>Tag</label>
            <input
              name="tag"
              placeholder="e.g. Placements, Internships, College Life"
              value={form.tag}
              onChange={handleChange}
            />
          </div>

          <button className="sa-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit application"}
          </button>
        </div>
      </div>
    </div>
  );
}
