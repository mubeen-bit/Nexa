import React from "react";
import "./Profile.css";
import { FaExternalLinkAlt } from "react-icons/fa";

const Profile = (props) => {
  return (
    <div className="content">
      <div className="link-icon">
        <FaExternalLinkAlt />
      </div>
      <h3>{props.name}</h3>
      <p> {props.college}</p>
      <p className="graduation">{props.classof}</p>
      <p className="placed">{props.placed}</p>
    </div>
  );
};

export default Profile;
