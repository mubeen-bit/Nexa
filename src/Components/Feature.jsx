import React, { useEffect, useState } from "react";
import "./Feature.css";
import Profile from "./Profile";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

// ✅ outside component — persists between navigations in the same session
let cachedSeniors = null;

const Feature = ({ search = "" }) => {
  const [seniors, setSeniors] = useState(cachedSeniors || []);
  const [loading, setLoading] = useState(!cachedSeniors);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (!cachedSeniors) {
      const loadSeniors = async () => {
        const { data, error } = await supabase.from("seniors").select("*");

        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }

        cachedSeniors = data; // ✅ save to cache
        setSeniors(data);
        setLoading(false);
      };

      loadSeniors();
    }

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredSeniors = seniors.filter(
    (student) =>
      (student.college ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (student.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (student.company ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const limit = search ? filteredSeniors.length : isMobile ? 7 : 10;
  const visibleSeniors = filteredSeniors.slice(0, limit);
  const hiddenCount = filteredSeniors.length - visibleSeniors.length;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
        Loading seniors...
      </div>
    );
  }

  return (
    <div>
      <div className="profile">
        {filteredSeniors.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#888",
              marginTop: "2rem",
              width: "100%",
            }}
          >
            No results found for "{search}"
          </p>
        ) : (
          visibleSeniors.map((student) => (
            <Link
              key={student.id}
              to={`/senior/${student.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Profile
                name={student.name}
                college={student.college}
                title={student.title}
                placed={student.company}
                avatar={student.avatar_url}
                skills={student.skills}
              />
            </Link>
          ))
        )}
      </div>

      {!search && hiddenCount > 0 && (
        <div className="more-seniors">
          <p>
            and <strong>{hiddenCount} more seniors</strong> waiting to help you
          </p>
          <p className="more-hint">
            Search by college, name, or company to find your senior
          </p>
        </div>
      )}
    </div>
  );
};

export default Feature;
