import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import LoginButton from "./LoginButton";
import EmailLogin from "./EmailLogin";
import { useNavigate } from "react-router-dom";
import "./SeniorApply.css";

export default function SeniorApply() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [existingApplication, setExistingApplication] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [form, setForm] = useState({
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
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // restore form data if saved before login redirect
    const savedForm = localStorage.getItem("seniorApplyForm");
    if (savedForm) {
      setForm(JSON.parse(savedForm));
    }

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("senior_applications")
          .select("status, created_at")
          .eq("user_id", user.id)
          .single();

        if (data) setExistingApplication(data);

        // if form was pending submission before login, close popup
        setShowLogin(false);
      }

      setCheckingAuth(false);
    };
    getUser();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
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
      return false;
    }

    if (
      !form.college_email.includes(".ac.in") &&
      !form.college_email.includes(".edu")
    ) {
      alert("Please enter a valid college email (.ac.in or .edu)");
      return false;
    }

    return true;
  };

  const submitApplication = async (loggedInUser) => {
    setLoading(true);

    const { error } = await supabase.from("senior_applications").insert({
      user_id: loggedInUser.id,
      email: loggedInUser.email,
      avatar_url: loggedInUser.user_metadata.avatar_url,
      ...form,
      price: Number(form.price),
    });

    if (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/notify/new-application`,
      {
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
          email: loggedInUser.email,
        }),
      },
    );

    console.log("Notify status:", response.status);

    localStorage.removeItem("seniorApplyForm");
    setSubmitted(true);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user) {
      // save form so it's restored after login
      localStorage.setItem("seniorApplyForm", JSON.stringify(form));
      setShowLogin(true);
      return;
    }

    submitApplication(user);
  };

  if (checkingAuth) {
    return (
      <div className="sa-wrap">
        <p className="sa-loading">Loading...</p>
      </div>
    );
  }

  // already applied
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

  // just submitted
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

  return (
    <div className="sa-wrap">
      {showLogin && (
        <div className="popup-overlay" onClick={() => setShowLogin(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowLogin(false)}>
              ✕
            </button>
            <h2>Sign in to continue</h2>
            <p>Please log in to submit your application.</p>
            <LoginButton />
            <div className="popup-divider">
              <span>or</span>
            </div>
            {/* <EmailLogin /> */}
          </div>
        </div>
      )}

      <div className="sa-card">
        <h1 className="sa-title">Become a senior mentor</h1>
        <p className="sa-sub">
          Share your experience and help juniors from your college succeed.
        </p>

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
