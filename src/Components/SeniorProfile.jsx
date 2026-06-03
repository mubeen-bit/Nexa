import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./SeniorProfile.css";
import { supabase } from "../lib/supabase";
import Students from "./Students";
import { useNavigate } from "react-router-dom";
import LoginButton from "./LoginButton";

const timezones = [
  "(GMT+1:00) Edinburgh, London (BST)",
  "(GMT+0:00) UTC",
  "(GMT+5:30) Mumbai, New Delhi (IST)",
  "(GMT-5:00) New York (EST)",
];

export default function MentorshipPage() {
  const { id } = useParams();
  const oldMentor = Students.find((student) => student.id === Number(id));
  const testimonials = oldMentor?.testimonials || [];
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [timezone, setTimezone] = useState(timezones[0]);
  const [testimonialPage, setTestimonialPage] = useState(0);
  const [booked, setBooked] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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

  // Group slots by day label
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

  // Auto-select first available day when slots load
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
      alert("Please select a slot");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setShowLogin(true);
      return;
    }

    const { error: bookingError } = await supabase.from("bookings").insert({
      junior_id: user.id,
      senior_id: Number(id),
      availability_id: selectedSlot.id,
    });

    if (bookingError) {
      console.error(bookingError);
      return;
    }

    const { error: availabilityError } = await supabase
      .from("availability")
      .update({
        is_booked: true,
      })
      .eq("id", selectedSlot.id);

    if (availabilityError) {
      console.error(availabilityError);
      return;
    }

    setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
    setBooked(true);
  };

  return (
    <div className="mentorship-page">
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
              <span className="badge">{mentor.tag}</span>
            </div>
            <h1 className="mentor-title">{mentor.title}</h1>
          </div>
          <img src={mentor.avatar_url} alt="mentor" className="mentor-avatar" />
        </div>

        <div className="divider" />

        <div className="meta-row">
          <div className="meta-item">
            <span>£</span>
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
          {/* <p className="cta">[{mentor.cta}]</p> */}
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
                new Date(selectedSlot.start_time).toLocaleString("en-GB", {
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

            {/* Day selector */}
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
                    onClick={() => setSelectedSlot(slot)}
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
            </div>

            <div className="sub-section">
              <p>Timezone</p>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {timezones.map((tz) => (
                  <option key={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <button
              className="continue-btn"
              onClick={bookSession}
              disabled={!selectedSlot}
            >
              Continue
            </button>
            {showLogin && (
              <div
                className="popup-overlay"
                onClick={() => setShowLogin(false)}
              >
                <div className="popup-box" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="popup-close"
                    onClick={() => setShowLogin(false)}
                  >
                    ✕
                  </button>
                  <h2>Sign in to continue</h2>
                  <p>Please log in to book a session with your mentor.</p>
                  <LoginButton />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
