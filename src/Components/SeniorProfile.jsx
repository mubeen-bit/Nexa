import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./SeniorProfile.css";
import { supabase } from "../lib/supabase";
import Students from "./Students";
import { useNavigate } from "react-router-dom";
import LoginButton from "./LoginButton";
import EmailLogin from "./EmailLogin";
import Header from "./Header";

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
    <div className="mentorship-page">
      <Header />
      {showLogin && (
        <div className="popup-overlay" onClick={() => setShowLogin(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowLogin(false)}>
              ✕
            </button>
            <h2>Sign in to continue</h2>
            <p>Please log in to book a session with your mentor.</p>
            <LoginButton />
            <div className="popup-divider">{/* <span>or</span> */}</div>
            {/* <EmailLogin /> */}
          </div>
        </div>
      )}

      {/* LEFT CARD */}
      <div className="card">
        <div className="card-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← <span>{mentor.name}</span>
          </button>
        </div>

        <div className="hero-section">
          <div>
            <div className="rating-row">
              <span className="star">★</span>
              <span>{mentor.rating}</span>
              <span className="badge">{mentor.rating_tag}</span>
            </div>
            <h1 className="mentor-title">{mentor.service}</h1>
          </div>
          <div className="mentor-avatar-container">
            {mentor.avatar_url ? (
              <img
                src={mentor.avatar_url}
                alt={mentor.name}
                className="mentor-avatar"
              />
            ) : (
              <div className="avatar-placeholder">
                {mentor.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="divider" />

        <div className="meta-row">
          <div className="meta-item">
            <span>₹</span>
            <span>{mentor.price}</span>
          </div>
          <div className="meta-divider" />
          <div className="meta-item">
            <span>🗓</span>
            <span>{mentor.duration}</span>
          </div>
        </div>

        <div className="divider" />

        <div className="section">
          <p>{mentor.description}</p>
        </div>

        <div className="section">
          <div className="testimonial-header">
            <h2>Testimonials</h2>
            <div className="arrow-group">
              <button
                onClick={() =>
                  setTestimonialPage(Math.max(0, testimonialPage - 1))
                }
              >
                ←
              </button>
              <button
                onClick={() =>
                  setTestimonialPage(
                    Math.min(totalPages - 1, testimonialPage + 1),
                  )
                }
              >
                →
              </button>
            </div>
          </div>

          <div className="testimonial-grid">
            {visibleTestimonials.map((t, index) => (
              <div className="testimonial-card" key={index}>
                <div className="testimonial-user">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <span>{t.name}</span>
                </div>
                <p>{t.review}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOOKING CARD */}
      <div className="booking-card">
        {booked ? (
          <div className="confirmed-wrap">
            <div className="confirmed-icon">✓</div>
            <h2>Session Booked!</h2>
            <p>
              Your session is confirmed for{" "}
              {selectedSlot &&
                new Date(selectedSlot.start_time).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>
            <button className="continue-btn" onClick={() => setBooked(false)}>
              Book Another Session
            </button>
          </div>
        ) : (
          <>
            <h2>When should we meet?</h2>

            <div className="day-row">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(day);
                    setSelectedSlot(null);
                  }}
                  className={selectedDay === day ? "day-btn active" : "day-btn"}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="sub-section">
              <p>Select time of day</p>
              <div className="time-grid">
                {visibleSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setSlotError(false);
                    }}
                    className={
                      selectedSlot?.id === slot.id
                        ? "time-btn active"
                        : "time-btn"
                    }
                  >
                    {new Date(slot.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>

              {slotError && (
                <p className="slot-error">
                  Please select a time slot before continuing.
                </p>
              )}
            </div>

            <button className="continue-btn" onClick={bookSession}>
              Pay & Book Session
            </button>
          </>
        )}
      </div>
    </div>
  );
}
