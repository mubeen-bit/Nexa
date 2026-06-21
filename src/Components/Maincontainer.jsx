import React from "react";
import { FaSearch } from "react-icons/fa";
import "./Maincontainer.css";

const Maincontainer = ({ search, setSearch }) => {
  return (
    <container id="main-container">
      <div className="heading">
        <h1>Your seniors have the answers.</h1>
      </div>

      <div className="para">
        <p>
          Book a 1:1 with a senior from your college. Get honest advice on
          placements, internships, and college life.
        </p>
      </div>

      <div className="s-btn">
        <input
          type="text"
          name="college"
          placeholder="Search by college or Senior"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={100}
        />
        <i className="s-icon">
          <FaSearch />
        </i>
      </div>
    </container>
  );
};

export default Maincontainer;
