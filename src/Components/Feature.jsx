import React, { useEffect, useState } from "react";
import "./Feature.css";
import Profile from "./Profile";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Feature = ({ search = "" }) => {
  const [seniors, setSeniors] = useState([]);

  useEffect(() => {
    const loadSeniors = async () => {
      const { data, error } = await supabase.from("seniors").select("*");

      if (error) {
        console.error(error);
        return;
      }

      setSeniors(data);
    };

    loadSeniors();
  }, []);

  const filteredSeniors = seniors.filter(
    (student) =>
      (student.college ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (student.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (student.company ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="profile">
      {filteredSeniors.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>
          No results found for "{search}"
        </p>
      ) : (
        filteredSeniors.map((student) => (
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
            />
          </Link>
        ))
      )}
    </div>
  );
};

export default Feature;
