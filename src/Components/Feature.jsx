import React, { useEffect, useState } from "react";
import "./Feature.css";
import Profile from "./Profile";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const Feature = () => {
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

  return (
    <div className="profile">
      {seniors.map((student) => (
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
            classof={student.class_of}
            placed={student.company}
          />
        </Link>
      ))}
    </div>
  );
};

export default Feature;
