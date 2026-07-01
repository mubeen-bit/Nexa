import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import LoginButton from "./LoginButton";
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
    whatsapp: "",
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
    const savedForm = localStorage.getItem("seniorApplyForm");

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
          .maybeSingle();

        if (data) {
          // already has an application
          setExistingApplication(data);
          localStorage.removeItem("seniorApplyForm");
          localStorage.removeItem("redirectAfterLogin");
        } else if (savedForm) {
          // ✅ user just logged in and has saved form — auto submit
          const parsedForm = JSON.parse(savedForm);
          setForm(parsedForm);
          submitApplication(user, parsedForm);
        }

        setShowLogin(false);
      } else if (savedForm) {
        // not logged in but has saved form — restore it
        setForm(JSON.parse(savedForm));
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
      !form.whatsapp ||
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

    if (!/^\d{10,15}$/.test(form.whatsapp.replace(/[\s+\-]/g, ""))) {
      alert("Please enter a valid WhatsApp number");
      return false;
    }

    return true;
  };

  const submitApplication = async (loggedInUser, formData = form) => {
    setLoading(true);

    const { error } = await supabase.from("senior_applications").insert({
      user_id: loggedInUser.id,
      email: loggedInUser.email,
      avatar_url: loggedInUser.user_metadata?.avatar_url,
      ...formData,
      price: Number(formData.price),
    });

    if (error) {
      console.error(error);
      if (error.code === "23505") {
        alert("You've already submitted an application.");
        setExistingApplication({ status: "pending" });
      } else {
        alert("Something went wrong. Please try again.");
      }
      setLoading(false);
      return;
    }

    await fetch(`${import.meta.env.VITE_API_URL}/api/notify/new-application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        college: formData.college,
        college_email: formData.college_email,
        whatsapp: formData.whatsapp,
        linkedin: formData.linkedin,
        year: formData.year,
        company: formData.company,
        title: formData.title,
        help_with: formData.help_with,
        email: loggedInUser.email,
      }),
    });

    localStorage.removeItem("seniorApplyForm");
    localStorage.removeItem("redirectAfterLogin");
    setSubmitted(true);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user) {
      localStorage.setItem("seniorApplyForm", JSON.stringify(form));
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      console.log("SET redirectAfterLogin:", window.location.pathname); // ✅
      console.log("VERIFY SET:", localStorage.getItem("redirectAfterLogin")); // ✅
      setShowLogin(true);
      return;
    }

    submitApplication(user);
  };

  if (checkingAuth || loading) {
    return (
      <div className="sa-wrap">
        <p className="sa-loading">
          {loading ? "Submitting your application..." : "Loading..."}
        </p>
      </div>
    );
  }

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
              <label>
                College email (Only for verification. Please login with your
                personal mail id)*
              </label>
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

          <div className="sa-row">
            <div className="sa-field">
              <label>WhatsApp number *</label>
              <input
                name="whatsapp"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={form.whatsapp}
                onChange={handleChange}
              />
            </div>

            <div className="sa-field">
              <label>LinkedIn profile URL</label>
              <input
                name="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={form.linkedin}
                onChange={handleChange}
              />
            </div>
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

          <div className="sa-field">
            <label>Please double check details before submission</label>
          </div>

          <button className="sa-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit application"}
          </button>
        </div>
      </div>
    </div>
  );
}
