import React from "react";
import { FaSearch } from "react-icons/fa";
import "./Maincontainer.css";

const Maincontainer = ({ search, setSearch }) => {
  return (
    <container id="main-container">
      <div className="heading">
        <h1>
          Get Ahead with the right information and guidance from your senior.
        </h1>
      </div>

      <div className="para">
        <p>
          Choose from the verified seniors below and take the right next step.
        </p>
      </div>

      <div className="s-btn">
        <input
          type="text"
          name="college"
          placeholder="Search for college.."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <i className="s-icon">
          <FaSearch />
        </i>
      </div>
    </container>
  );
};

export default Maincontainer;
