import React from "react";
import "./sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">TrainFast</div>
      <h4>Speeding You Ahead</h4>
      <nav>
        <ul>
          <li>Home</li>
          <li>Search Train</li>
          <li>My Booking</li>
          <li>History</li>
        </ul>
      </nav>
      <div className="support-settings">
        <div className="support">
          <p>Customer Support</p>
        </div>
        <div className="settings">
          <p>Settings</p>
        </div>
        <div className="miniProfile">
          <h4>Hana</h4>
          <div>
            <p>Tier gold</p>
            <p>19.256 PTS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
