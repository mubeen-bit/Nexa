import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Mysessions.css";

export default function MySessions() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let userId = null;

    const loadBookings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      userId = user.id;

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          seniors (
            name,
            company,
            avatar_url
          ),
          availability (
            start_time,
            end_time
          )
        `,
        )
        .eq("junior_id", user.id);

      console.log(data);
      console.log(error);

      setBookings(data || []);
    };

    loadBookings();

    // Realtime: update the booking row in state when senior saves a meet link
    const channel = supabase
      .channel("bookings-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === payload.new.id ? { ...b, ...payload.new } : b,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const getStatusClass = (status) =>
    status === "confirmed"
      ? "confirmed"
      : status === "cancelled"
        ? "cancelled"
        : "pending";

  return (
    <div className="ms-wrap">
      <h1 className="ms-header">My sessions</h1>

      {bookings.length === 0 ? (
        <p className="ms-empty">No sessions booked yet.</p>
      ) : (
        bookings.map((booking) => (
          <div className="ms-card" key={booking.id}>
            {booking.seniors.avatar_url ? (
              <img
                src={booking.seniors.avatar_url}
                alt={booking.seniors.name}
                className="ms-avatar"
              />
            ) : (
              <div className="ms-avatar">
                {getInitials(booking.seniors.name)}
              </div>
            )}

            <div className="ms-info">
              <p className="ms-name">{booking.seniors.name}</p>
              <p className="ms-company">{booking.seniors.company}</p>
              <p className="ms-time">
                🗓{" "}
                {new Date(booking.availability.start_time).toLocaleString(
                  "en-GB",
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
              {booking.meeting_link ? (
                <a
                  href={booking.meeting_link}
                  target="_blank"
                  rel="noreferrer"
                  className="ms-join-btn"
                >
                  Join meeting
                </a>
              ) : (
                <p className="ms-no-link">
                  Link will be updated by the senior before the meeting starts.
                  Any issues?{" "}
                  <a href="mailto:support@yoursite.com">Contact support</a>.
                </p>
              )}
            </div>

            <span className={`ms-badge ${getStatusClass(booking.status)}`}>
              {booking.status ?? "Pending"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
