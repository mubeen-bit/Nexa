import React from "react";
import "./Profile.css";
import {
  GraduationCap,
  Building2,
  Star,
  ShieldCheck,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  Clock3,
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
    "Interview Prep",
    "Career Guidance",
    "DSA",
    "Placement",
  ];
  const visibleSkills = skills.slice(0, 2);
  const extraSkills = skills.length > 2 ? skills.length - 2 : 0;

  return (
    <div className="pc-card">
      {/* ── HEADER ── */}
      <div className="pc-header">
        <div className="pc-avatar-wrap">
          {props.avatar ? (
            <img src={props.avatar} alt={props.name} className="pc-avatar" />
          ) : (
            <div className="pc-avatar-initials">{initials}</div>
          )}
          <div className="pc-verified-dot" title="Verified mentor">
            <BadgeCheck size={14} color="#2563EB" />
          </div>
        </div>

        <div className="pc-header-info">
          <div className="pc-name-row">
            <h3 className="pc-name">{props.name}</h3>
            <ArrowUpRight size={16} className="pc-arrow" />
          </div>

          {props.title && <p className="pc-role">{props.title}</p>}

          {props.college && (
            <span className="pc-meta-item">
              <GraduationCap size={12} />
              <span className="pc-meta-text">{props.college}</span>
            </span>
          )}

          {props.placed && (
            <span className="pc-meta-item">
              <Building2 size={12} />
              <span className="pc-meta-text">{props.placed}</span>
            </span>
          )}
        </div>
      </div>

      {/* ── VERIFIED / RATING ── */}
      <div className="pc-trust">
        <span className="pc-verified-badge">
          <ShieldCheck size={11} /> Verified mentor
        </span>
      </div>

      {/* ── SKILLS ── */}
      <div className="pc-skills">
        {visibleSkills.map((s) => (
          <span className="pc-skill" key={s}>
            {s}
          </span>
        ))}
        {extraSkills > 0 && (
          <span className="pc-skill pc-skill-more">+{extraSkills}</span>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="pc-footer">
        <div className="pc-footer-meta">
          {props.price && (
            <span className="pc-footer-item">
              <CircleDollarSign size={13} />₹{props.price}
            </span>
          )}
          {props.duration && (
            <span className="pc-footer-item">
              <Clock3 size={13} />
              {props.duration} min
            </span>
          )}
          <span className="pc-footer-item pc-available">
            <CalendarDays size={13} />
            Available
          </span>
        </div>
        <span className="pc-cta">
          View profile <ArrowUpRight size={13} className="pc-cta-arrow" />
        </span>
      </div>
    </div>
  );
};

export default Profile;
