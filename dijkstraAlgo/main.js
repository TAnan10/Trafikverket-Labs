// Request Data
const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const authenticationKey = "ab40edaaea014a42a5b8ef8ba170aaad";
const requestBody = `
<REQUEST>
  <LOGIN authenticationkey="${authenticationKey}"/>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="10000">
    <FILTER>
    <EQ name="LocationSignature" value="M"/>
    </FILTER>
  </QUERY>
  <QUERY objecttype="TrainStation" namespace="rail.infrastructure" schemaversion="1.5">
    <FILTER></FILTER>
  </QUERY>
</REQUEST>
`;

// Send the request
fetch("https://api.trafikinfo.trafikverket.se/v2/data.json", {
  method: "POST",
  headers: {
    "Content-Type": "text/xml",
  },
  body: requestBody,
})
  .then((response) => response.json())

  .then((data) => {
    printTrains(data);
  })

  .catch((error) => console.error("Error fetching data:", error));

// Check every train being called in Malmö Central
function printTrains(data) {
  const TrainAnnouncement = data.RESPONSE.RESULT[0].TrainAnnouncement;
  const encounteredValues = [];
  const route = [];

  TrainAnnouncement.forEach((train) => {
    if (train.TrainOwner === "SJ") {
      const trainNumber = train.AdvertisedTrainIdent;
      const trainFromStation = train.FromLocation;
      const trainViaFromLocation = train.ViaToLocation;
      const trainToLocation = train.ToLocation;

      if (!encounteredValues.includes(trainNumber)) {
        encounteredValues.push(trainNumber);
        encounteredValues.push(trainFromStation);
        encounteredValues.push(trainViaFromLocation);
        encounteredValues.push(trainToLocation);
      }

      if (!route.includes(trainNumber) && !route.includes(trainFromStation)) {
      }
    }
  });

  encounteredValues.forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach((station) => {
        const shortName = station.LocationName;
        const TrainStation = data.RESPONSE.RESULT[1].TrainStation;
        TrainStation.forEach((station) => {
          if (station.LocationSignature === shortName) {
            console.log(
              `${station.LocationSignature} = ${station.AdvertisedLocationName}`
            );
          }
        });
      });
    } else if (typeof item === "string") {
      console.log(item);
    }
  });

  console.log(encounteredValues.length);
}

// Print the values in ascending order
function printTrainNumberInOrder() {
  encounteredValues.sort((a, b) => a - b);
  for (let i = 0; i < encounteredValues.length; i++) {
    console.log(encounteredValues[i]);
  }
}