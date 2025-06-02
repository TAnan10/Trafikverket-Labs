import React from "react";
import "./traincard.css";

const TrainCard = ({ train }) => {
  const {
    AdvertisedTrainIdent,
    AdvertisedTimeAtLocation,
    FromLocation,
    ViaToLocation,
    ArrivalTimeAtMalmo,
  } = train;

  return (
    <div className="train-card">
      <div className="train-details">
        <h3 className="train-id">{AdvertisedTrainIdent}</h3>
        <div className="time-info">
          <div className="departure">
            <p className="label">Departure Time:</p>
            <p className="value">
              {new Date(AdvertisedTimeAtLocation).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="arrival">
            <p className="label">Arrival Time at Malmö:</p>
            <p className="value">
              {new Date(ArrivalTimeAtMalmo).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="location-info">
          <p className="from-location">
            <span className="label">From:</span> {FromLocation[0].LocationName}
          </p>
          <p className="via-location">
            <span className="label">Via:</span>
          </p>
          <ul className="via-locations">
            {ViaToLocation.map((location, index) => (
              <li key={index}>{location.LocationName}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="select-section">
        <button className="select-btn">Select</button>
      </div>
    </div>
  );
};

export default TrainCard;
