import React from "react";
import "./Profile.css";
import {
  GraduationCap,
  Building2,
  Star,
  ShieldCheck,
  ArrowUpRight,
  BadgeCheck,
} from "lucide-react";

const Profile = (props) => {
  const initials = props.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const skills = props.skills || [
    "Resume Review",
    "Career Guidance",
    "Interview Prep",
  ];

  return (
    <div className="pc-card">
      {/* TOP */}
      <div className="pc-top">
        <div className="pc-avatar-wrap">
          {props.avatar ? (
            <img src={props.avatar} alt={props.name} className="pc-avatar" />
          ) : (
            <div className="pc-avatar-initials">{initials}</div>
          )}
          <div className="pc-verified-dot" title="Verified">
            <BadgeCheck size={14} color="#2563EB" />
          </div>
        </div>

        <div className="pc-arrow">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* INFO */}
      <div className="pc-info">
        <h3 className="pc-name">{props.name}</h3>

        {props.title && <p className="pc-role">{props.title}</p>}

        <div className="pc-meta">
          {props.college && (
            <span className="pc-meta-item">
              <GraduationCap size={13} />
              {props.college}
            </span>
          )}
          {props.placed && (
            <span className="pc-meta-item">
              <Building2 size={13} />
              {props.placed}
            </span>
          )}
        </div>
      </div>

      {/* RATING */}
      <div className="pc-rating">
        <div className="pc-stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={11} fill="#D4A017" color="#D4A017" />
          ))}
        </div>
        <span className="pc-rating-val">4.9</span>
        <span className="pc-rating-count">· 42 reviews</span>
        <span className="pc-verified-badge">
          <ShieldCheck size={11} /> Verified
        </span>
      </div>

      {/* SKILLS */}
      <div className="pc-skills">
        {skills.slice(0, 3).map((s) => (
          <span className="pc-skill" key={s}>
            {s}
          </span>
        ))}
      </div>

      {/* FOOTER */}
      <div className="pc-footer">
        {props.placed && (
          <span className="pc-placement">
            <Building2 size={12} /> {props.placed}
          </span>
        )}
        <span className="pc-cta">
          View profile <ArrowUpRight size={13} />
        </span>
      </div>
    </div>
  );
};

export default Profile;
