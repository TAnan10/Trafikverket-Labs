// Request Data
const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const authenticationKey = "ab40edaaea014a42a5b8ef8ba170aaad";
const requestBody = `
<REQUEST>
  <LOGIN authenticationkey="${authenticationKey}"/>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9">
    <FILTER>
    <EQ name="LocationSignature" value="M"/>
    </FILTER>
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
    console.log(data);
    printTrains(data);
  })

  .catch((error) => console.error("Error fetching data:", error));

// Check every train being called in Malmö Central
function printTrains(data) {
  const TrainAnnouncement = data.RESPONSE.RESULT[0].TrainAnnouncement;
  const encounteredValues = [];
  const route = [];

  // console.log(TrainAnnouncement);

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
    }
  });

  encounteredValues.forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach((station) => {
        console.log(station.LocationName);
      });
    } else if (typeof item === 'string') {
      console.log(item);
  }
  });
}

// Print the values in ascending order
function printTrainNumberInOrder() {
  encounteredValues.sort((a, b) => a - b);
  for (let i = 0; i < encounteredValues.length; i++) {
    console.log(encounteredValues[i]);
  }
}
