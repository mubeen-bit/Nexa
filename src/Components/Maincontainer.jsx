import React from "react";
import { FaSearch } from "react-icons/fa";
import "./Maincontainer.css";

const Maincontainer = ({ search, setSearch }) => {
  return (
    <container id="main-container">
      <div className="heading">
        <h1>
          No more confusion about "How is this college?" — hear it straight from
          your seniors and learn how to make the most of it.
        </h1>
      </div>

      <div className="para">
        <p>Choose from the verified seniors and take the right next step.</p>
      </div>

      <div className="s-btn">
        <input
          type="text"
          name="college"
          placeholder="Search by college or Senior"
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
