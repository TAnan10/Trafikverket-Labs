import React, { useEffect, useState } from "react";
import "./trainlist.css";
import TrainCard from "../traincard/traincard";

// Function to fetch and process train data
const fetchTrainData = async () => {
  const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
  const authenticationKey = "ad56290a9f264c73937fb006a1a42b94";
  const requestBody = `
  <REQUEST>
    <LOGIN authenticationkey="${authenticationKey}"/>
    <QUERY objecttype="TrainAnnouncement" schemaversion="1.9">
      <FILTER>
        <EQ name="FromLocation.LocationName" value="G" />
        <EQ name="DepartureDateOTN" value="${currentDate}" />
        <EQ name="ActivityType" value="Avgang" />
      </FILTER>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>FromLocation.LocationName</INCLUDE>
      <INCLUDE>ViaToLocation.LocationName</INCLUDE>
      <INCLUDE>LocationSignature</INCLUDE>
    </QUERY>
    <QUERY objecttype="TrainAnnouncement" schemaversion="1.9">
      <FILTER>
        <EQ name="LocationSignature" value="M" />
        <EQ name="DepartureDateOTN" value="${currentDate}" />
        <EQ name="ActivityType" value="Ankomst" />
        <EQ name="FromLocation.LocationName" value="G" />
      </FILTER>
      <INCLUDE>AdvertisedTrainIdent</INCLUDE>
      <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      <INCLUDE>FromLocation.LocationName</INCLUDE>
      <INCLUDE>ViaToLocation.LocationName</INCLUDE>
    </QUERY>
    <QUERY objecttype="TrainStation" namespace="rail.infrastructure" schemaversion="1.5">
      <FILTER></FILTER>
    </QUERY>
  </REQUEST>
  `;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/xml",
    },
    body: requestBody,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  console.log("Fetched Data:", data); // Print out the entire fetched data
  return data;
};

const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().split("T")[0] + "T00:00:00.000+02:00";
};

const currentDate = getCurrentDate();

const TrainList = () => {
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mainData = await fetchTrainData();
        const gothenburgTrains = mainData.RESPONSE.RESULT[0].TrainAnnouncement;
        const malmoTrains = mainData.RESPONSE.RESULT[1].TrainAnnouncement;

        const matchingTrains = gothenburgTrains.filter((gothenburgTrain) =>
          malmoTrains.some(
            (malmoTrain) =>
              malmoTrain.AdvertisedTrainIdent ===
              gothenburgTrain.AdvertisedTrainIdent
          )
        );

        const uniqueTrains = matchingTrains.reduce((acc, current) => {
          const malmoTrain = malmoTrains.find(
            (malmo) =>
              malmo.AdvertisedTrainIdent === current.AdvertisedTrainIdent
          );
          if (
            !acc.some(
              (item) =>
                item.AdvertisedTrainIdent === current.AdvertisedTrainIdent
            )
          ) {
            acc.push({
              ...current,
              ArrivalTimeAtMalmo: malmoTrain
                ? malmoTrain.AdvertisedTimeAtLocation
                : null,
            });
          }
          return acc;
        }, []);

        setTrains(uniqueTrains);
      } catch (error) {
        console.error("Error fetching train data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="train-list">
      {trains.map((train, index) => (
        <TrainCard
          key={`${train.AdvertisedTrainIdent}-${index}`}
          train={train}
        />
      ))}
    </div>
  );
};

export default TrainList;
