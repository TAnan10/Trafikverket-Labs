import React from "react";
import "./searchform.css";

const SearchForm = ({ onSearch }) => {
  return (
    <div className="search-form-container">
      <h2>Find Your Train Schedule</h2>
      <form className="search-form">
        <div className="form-group">
          <label htmlFor="origin">Origin</label>
          <select id="origin">
            <option value="Yogyakarta">Gothenburg (ALL)</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <select id="destination">
            <option value="Jakarta">Malmö (ALL)</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="departure">Departure</label>
          <input type="date" id="departure" />
        </div>
        <div className="form-group">
          <label htmlFor="return">Return</label>
          <input type="date" id="return" />
        </div>
        <div className="form-group">
          <label htmlFor="passenger">Passenger</label>
          <select id="passenger">
            <option value="1">1 Adult</option>
            {/* Add more options as needed */}
          </select>
        </div>
      </form>
      <div className="search-train">
        <button className="search-button" onClick={onSearch}>
          Search Train
        </button>
      </div>
    </div>
  );
};

export default SearchForm;
