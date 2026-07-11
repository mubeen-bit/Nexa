import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./SeniorProfile.css";
import { supabase } from "../lib/supabase";
import Students from "./Students";
import { useNavigate } from "react-router-dom";
import LoginButton from "./LoginButton";

import Header from "./Header";
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Clock,
  Users,
  Zap,
  IndianRupee,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Lock,
  X,
  Mail,
  Check,
  AlertCircle,
  Award,
  CalendarX,
} from "lucide-react";

export default function MentorshipPage() {
  const { id } = useParams();
  const oldMentor = Students.find((student) => student.id === Number(id));
  const testimonials = oldMentor?.testimonials || [];
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [testimonialPage, setTestimonialPage] = useState(0);
  const [booked, setBooked] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [slotError, setSlotError] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const faqs = [
    {
      q: "How do I join the meeting?",
      a: "After booking, your senior will share a Google Meet link before the session. You'll also find it in My Sessions.",
    },
    {
      q: "Can I reschedule?",
      a: "Contact us on WhatsApp at least 12 hours before the session and we'll help you find a new time.",
    },
    {
      q: "What if I miss my session?",
      a: "Reach out immediately on WhatsApp or email. We'll do our best to arrange a reschedule.",
    },
    {
      q: "How do refunds work?",
      a: "If the session is cancelled or the senior doesn't attend, we offer a full refund within 5–7 business days.",
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      const { data: seniorData, error: seniorError } = await supabase
        .from("seniors")
        .select("*")
        .eq("id", id)
        .single();

      console.log("SENIOR:", seniorData);
      console.log("SENIOR ERROR:", seniorError);

      setMentor(seniorData);

      const { data: slotData, error: slotError } = await supabase
        .from("availability")
        .select("*")
        .eq("senior_id", id)
        .eq("is_booked", false)
        .gt("start_time", new Date().toISOString())
        .order("start_time");

      console.log("SLOTS:", slotData);
      console.log("SLOT ERROR:", slotError);

      setSlots(slotData || []);
    };

    loadData();
  }, [id]);

  const createOrder = async () => {
    const API_URL = import.meta.env.VITE_API_URL;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      setShowLogin(true);
      return;
    }

    // ✅ get session token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(`${API_URL}/api/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`, // ✅
      },
      body: JSON.stringify({ seniorId: mentor.id }),
    });

    const order = await response.json();
    console.log("FULL ORDER:", order);

    if (!order.id) {
      console.error("Order creation failed:", order);
      alert("Something went wrong creating the order. Please try again.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: "SeniorJR",
      description: "Mentorship Session",

      handler: async function (razorpayResponse) {
        console.log("PAYMENT SUCCESS", razorpayResponse);

        const verifyResponse = await fetch(
          `${API_URL}/api/payment/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`, // ✅
            },
            body: JSON.stringify({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              seniorId: mentor.id,
              availabilityId: selectedSlot.id,
              // ✅ juniorId removed — comes from JWT on backend
            }),
          },
        );

        const result = await verifyResponse.json();
        console.log("VERIFY RESULT", result);

        if (result.success) {
          setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
          setSelectedSlot(null);
          setSelectedDay(null);
          setBooked(true);
        } else {
          alert(result.message);
        }
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const slotsByDay = slots.reduce((acc, slot) => {
    const day = new Date(slot.start_time).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  const days = Object.keys(slotsByDay);

  useEffect(() => {
    if (days.length > 0 && !selectedDay) {
      setSelectedDay(days[0]);
    }
  }, [slots]);

  const visibleSlots = selectedDay ? slotsByDay[selectedDay] || [] : [];

  if (!mentor) {
    return <h1>Loading...</h1>;
  }

  const testimonialsPerPage = 2;
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);
  const visibleTestimonials = testimonials.slice(
    testimonialPage * testimonialsPerPage,
    testimonialPage * testimonialsPerPage + testimonialsPerPage,
  );

  const bookSession = async () => {
    if (!selectedSlot) {
      setSlotError(true);
      return;
    }

    setSlotError(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      setShowLogin(true);
      return;
    }

    createOrder();
  };

  return (
    <div className="mp-page">
      {showLogin && (
        <div className="mp-overlay" onClick={() => setShowLogin(false)}>
          <div className="mp-login-box" onClick={(e) => e.stopPropagation()}>
            <button className="mp-close" onClick={() => setShowLogin(false)}>
              <X size={16} />
            </button>
            <div className="mp-login-icon">
              <Lock size={26} color="#2563EB" />
            </div>
            <h2>Sign in to continue</h2>
            <p>
              Book your session securely. We never post anything without your
              permission.
            </p>
            <LoginButton redirectTo={window.location.pathname} />
            <p className="mp-login-note">
              <ShieldCheck size={12} /> Secure · Private · No spam
            </p>
          </div>
        </div>
      )}

      {/* ── LEFT CARD ── */}
      <div className="mp-card">
        <div className="mp-card-header">
          <button className="mp-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back
          </button>
        </div>

        <div className="mp-hero">
          <div className="mp-hero-left">
            <div className="mp-badges">
              <span className="mp-badge verified">
                <ShieldCheck size={11} /> Verified mentor
              </span>
              <span className="mp-badge top">Top rated</span>
            </div>
            <h1 className="mp-name">{mentor.name}</h1>
            <p className="mp-mentor-role">{mentor.title}</p>
            <div className="mp-rating-row">
              <div className="mp-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} fill="#D4A017" color="#D4A017" />
                ))}
              </div>
              <span className="mp-rating-val">{mentor.rating}</span>
              <span className="mp-rating-count">· 1 reviews</span>
            </div>
            <div className="mp-response" style={{ marginTop: 10 }}>
              <Zap size={12} color="#2563EB" /> Responds within 2 hours
            </div>
          </div>
          <div className="mp-avatar-wrap">
            {mentor.avatar_url ? (
              <img
                src={mentor.avatar_url}
                alt={mentor.name}
                className="mp-avatar"
              />
            ) : (
              <div className="mp-avatar-placeholder">
                {mentor.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="mp-skills">
          {[
            "Resume Review",
            "Placement Prep",
            "Mock Interview",
            "Career Guidance",
            "DSA",
          ].map((s) => (
            <span className="mp-skill" key={s}>
              {s}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="mp-stats">
          <div className="mp-stat">
            <div className="mp-stat-icon-wrap">
              <IndianRupee size={15} />
            </div>
            <div>
              <p className="mp-stat-label">Price</p>
              <p className="mp-stat-val">₹{mentor.price}</p>
            </div>
          </div>
          <div className="mp-stat">
            <div className="mp-stat-icon-wrap">
              <Clock size={15} />
            </div>
            <div>
              <p className="mp-stat-label">Duration</p>
              <p className="mp-stat-val">{mentor.duration} min</p>
            </div>
          </div>
          {/* <div className="mp-stat">
            <div className="mp-stat-icon-wrap">
              <Users size={15} />
            </div>
            <div>
              <p className="mp-stat-label">Sessions</p>
              <p className="mp-stat-val">10+</p>
            </div>
          </div> */}
          {/* <div className="mp-stat">
            <div className="mp-stat-icon-wrap">
              <Award size={15} />
            </div>
            <div>
              <p className="mp-stat-label">Experience</p>
              <p className="mp-stat-val">1 yrs</p>
            </div>
          </div> */}
        </div>

        <div className="mp-divider" />

        {/* About */}
        <div className="mp-section">
          <h3 className="mp-section-title">About this session</h3>
          <p className="mp-desc">{mentor.description}</p>
          <div className="mp-bullets">
            <p className="mp-bullet-title">What you'll get</p>
            <ul>
              {[
                "Resume and LinkedIn review",
                "Placement strategy and roadmap",
                "Mock interview with feedback",
                "Honest college and career advice",
              ].map((b) => (
                <li key={b}>
                  <CheckCircle size={13} /> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mp-divider" />

        {/* Reviews */}
        {/* <div className="mp-section">
          <div className="mp-section-header">
            <h3 className="mp-section-title">What students say</h3>
            <div className="mp-arrows">
              <button
                onClick={() =>
                  setTestimonialPage(Math.max(0, testimonialPage - 1))
                }
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() =>
                  setTestimonialPage(
                    Math.min(totalPages - 1, testimonialPage + 1),
                  )
                }
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
          {visibleTestimonials.length > 0 ? (
            <div className="mp-reviews">
              {visibleTestimonials.map((t, i) => (
                <div className="mp-review-card" key={i}>
                  <div className="mp-review-top">
                    <div className="mp-review-avatar">{t.avatar}</div>
                    <div>
                      <p className="mp-review-name">{t.name}</p>
                      <div className="mp-review-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={10}
                            fill="#D4A017"
                            color="#D4A017"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="mp-review-text">{t.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              No reviews yet — be the first to book!
            </p>
          )}
        </div> */}

        <div className="mp-divider" />

        {/* Trust */}
        <div className="mp-section">
          <h3 className="mp-section-title">Why students trust this mentor</h3>
          <div className="mp-trust-list">
            {[
              ["Verified senior profile", ShieldCheck],
              ["Secure payments via Razorpay", Lock],
              ["100% private 1:1 session", Users],
              ["Instant booking confirmation", CheckCircle],
              ["Reschedule available on request", Clock],
            ].map(([label, Icon]) => (
              <div className="mp-trust-item" key={label}>
                <Icon size={14} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mp-divider" />

        {/* FAQ */}
        <div className="mp-section">
          <h3 className="mp-section-title">Frequently asked questions</h3>
          <div className="mp-faq">
            {faqs.map((f, i) => (
              <div className="mp-faq-item" key={i}>
                <button
                  className="mp-faq-q"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  {f.q}
                  {faqOpen === i ? (
                    <ChevronUp size={15} />
                  ) : (
                    <ChevronDown size={15} />
                  )}
                </button>
                {faqOpen === i && <p className="mp-faq-a">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOOKING CARD ── */}
      <div className="mp-booking">
        {booked ? (
          <div className="mp-confirmed">
            <div className="mp-confirmed-icon">
              <CheckCircle size={32} color="#16A34A" />
            </div>
            <h2>Session confirmed</h2>
            <p>Your booking is confirmed.</p>
            <div className="mp-confirmed-details">
              <div className="mp-confirmed-detail-row">
                <span>Mentor</span>
                <span>{mentor.name}</span>
              </div>
              <div className="mp-confirmed-detail-row">
                <span>Duration</span>
                <span>{mentor.duration} min</span>
              </div>
              {selectedSlot && (
                <div className="mp-confirmed-detail-row">
                  <span>When</span>
                  <span>
                    {new Date(selectedSlot.start_time).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
              <div className="mp-confirmed-detail-row">
                <span>Amount paid</span>
                <span>₹{mentor.price}</span>
              </div>
            </div>
            <p className="mp-confirmed-email">
              <Mail size={12} /> Confirmation sent to your email
            </p>
            <button
              className="mp-btn-secondary"
              onClick={() => setBooked(false)}
            >
              Book another session
            </button>
          </div>
        ) : (
          <>
            <h2 className="mp-booking-title">Book your session</h2>
            <p className="mp-booking-sub">
              Choose a date and time that works for you
            </p>

            {visibleSlots.length > 0 && (
              <div className="mp-slots-available">
                <CheckCircle size={12} /> {visibleSlots.length} slots available
              </div>
            )}

            {days.length === 0 ? (
              <div className="mp-empty">
                <div className="mp-empty-icon">
                  <CalendarX size={22} />
                </div>
                <h3>No slots available</h3>
                <p>
                  This mentor hasn't added availability yet. Check back soon.
                </p>
              </div>
            ) : (
              <>
                <div className="mp-day-row">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedSlot(null);
                      }}
                      className={`mp-day-btn ${selectedDay === day ? "active" : ""}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <p className="mp-time-label">Available times</p>
                <div className="mp-time-grid">
                  {visibleSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setSlotError(false);
                      }}
                      className={`mp-time-btn ${selectedSlot?.id === slot.id ? "active" : ""}`}
                    >
                      {selectedSlot?.id === slot.id && <Check size={12} />}
                      {new Date(slot.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </button>
                  ))}
                </div>
              </>
            )}

            {slotError && (
              <p className="mp-slot-error">
                <AlertCircle size={13} /> Select a time slot to continue
              </p>
            )}

            {selectedSlot && (
              <div className="mp-summary">
                <p className="mp-summary-heading">Session summary</p>
                <div className="mp-summary-row">
                  <span>Mentor</span>
                  <span>{mentor.name}</span>
                </div>
                <div className="mp-summary-row">
                  <span>Duration</span>
                  <span>{mentor.duration} min</span>
                </div>
                <div className="mp-summary-row">
                  <span>Time</span>
                  <span>
                    {new Date(selectedSlot.start_time).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="mp-summary-row total">
                  <span>Total</span>
                  <span>₹{mentor.price}</span>
                </div>
              </div>
            )}

            <button className="mp-btn-primary" onClick={bookSession}>
              <Lock size={14} /> Continue to secure payment
            </button>

            <div className="mp-payment-trust">
              <span className="mp-payment-trust-item">
                <ShieldCheck size={12} /> SSL secured
              </span>
              <span className="mp-payment-trust-item">
                <Lock size={12} /> Razorpay
              </span>
              <span className="mp-payment-trust-item">
                <CheckCircle size={12} /> No hidden charges
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
