import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "./SeniorDashboard.css";

export default function SeniorDashboard() {
  const [bookings, setBookings] = useState([]);
  const [meetLinks, setMeetLinks] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/");
        return;
      }

      const { data: senior, error: seniorError } = await supabase
        .from("seniors")
        .select("*")
        .eq("email", user.email)
        .single();

      if (!senior || seniorError) {
        console.error("Senior not found:", seniorError);
        navigate("/");
        return;
      }

      console.log("Senior found:", senior.id);

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          profiles!bookings_junior_id_fkey (
            full_name,
            email
          ),
          availability!bookings_availability_id_fkey (
            start_time,
            end_time
          )
        `,
        )
        .eq("senior_id", senior.id)
        .order("booked_at", { ascending: false });

      console.log("Bookings data:", data);
      console.log("Bookings error:", error);

      if (error) {
        console.error("Failed to load bookings:", error);
        setLoading(false);
        return;
      }

      setBookings(data || []);

      const links = {};
      data?.forEach((b) => {
        links[b.id] = b.meeting_link || "";
      });
      setMeetLinks(links);
      setLoading(false);
    };

    init();
  }, []);

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const saveMeetLink = async (bookingId) => {
    const { error } = await supabase
      .from("bookings")
      .update({ meeting_link: meetLinks[bookingId] })
      .eq("id", bookingId);

    if (error) {
      console.error(error);
      return;
    }

    setSaved((prev) => ({ ...prev, [bookingId]: true }));
    setTimeout(
      () => setSaved((prev) => ({ ...prev, [bookingId]: false })),
      3000,
    );
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="sd-wrap">
      <h1 className="sd-header">Senior dashboard</h1>

      {bookings.length === 0 ? (
        <p className="sd-empty">No bookings yet.</p>
      ) : (
        bookings.map((booking) => (
          <div className="sd-card" key={booking.id}>
            <div className="sd-top">
              <div className="sd-avatar">
                {getInitials(booking.profiles?.full_name)}
              </div>

              <div className="sd-info">
                <p className="sd-name">{booking.profiles?.full_name}</p>
                <p className="sd-email">{booking.profiles?.email}</p>
                <p className="sd-time">
                  🗓{" "}
                  {booking.availability?.start_time
                    ? new Date(booking.availability.start_time).toLocaleString(
                        "en-GB",
                        {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )
                    : "Time unavailable"}
                </p>
              </div>

              <span className="sd-badge">{booking.status ?? "Confirmed"}</span>
            </div>

            <hr className="sd-divider" />

            <div className="sd-link-row">
              <input
                type="text"
                placeholder="Paste Google Meet link"
                value={meetLinks[booking.id] || ""}
                onChange={(e) =>
                  setMeetLinks((prev) => ({
                    ...prev,
                    [booking.id]: e.target.value,
                  }))
                }
              />
              <button onClick={() => saveMeetLink(booking.id)}>
                Save link
              </button>
            </div>

            {saved[booking.id] && <p className="sd-saved">✓ Link saved</p>}
          </div>
        ))
      )}
    </div>
  );
}
