// Information of Request
const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const authenticationKey = "ab40edaaea014a42a5b8ef8ba170aaad";
const requestBody = `
<REQUEST>
  <LOGIN authenticationkey="ab40edaaea014a42a5b8ef8ba170aaad"/>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9">
    <FILTER>
      <EQ name="FromLocation.LocationName" value="M" />
      <EQ name="TrainOwner" value="SJ" />
      <EQ name="OperationalTransportIdentifiers.StartDate" value="2024-04-15" />
    </FILTER>
    <INCLUDE>LocationSignature</INCLUDE>
    <INCLUDE>ActivityType</INCLUDE>
    <INCLUDE>FromLocation.LocationName</INCLUDE>
    <INCLUDE>ViaFromLocation</INCLUDE>
    <INCLUDE>ViaToLocation</INCLUDE>
    <INCLUDE>ToLocation.LocationName</INCLUDE>
    <INCLUDE>TrainOwner</INCLUDE>
    <INCLUDE>AdvertisedTrainIdent</INCLUDE>
    <INCLUDE>OperationalTransportIdentifiers.StartDate</INCLUDE>
  </QUERY>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9">
    <FILTER>
      <EQ name="FromLocation.LocationName" value="G" />
      <EQ name="Operator" value="SJ" />
      <EQ name="OperationalTransportIdentifiers.StartDate" value="2024-04-12" />
    </FILTER>
    <INCLUDE>AdvertisedTrainIdent</INCLUDE>
    <INCLUDE>ToLocation.LocationName</INCLUDE>
    <INCLUDE>ViaFromLocation.LocationName</INCLUDE>
    <INCLUDE>ViaToLocation.LocationName</INCLUDE>
  </QUERY>
</REQUEST>
`;

// Add hallsberg & nässjö to the list

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
    showTrainRoutes(data);
  })

  .catch((error) => console.error("Error fetching data:", error));

// Helper Functions
function stockholm(data) {
  const stockholmTrain = data.RESPONSE.RESULT[9].TrainAnnouncement;
  let found = false;

  stockholmTrain.forEach((obj) => {
    if (obj.ToLocation[0].LocationName === "Ör") {
      found = true;
    }
  });

  if (found) {
    console.log("yay we found it");
  } else {
    console.log("not found");
  }
}

function gothenburg(data) {
  const gothenburgTrain = data.RESPONSE.RESULT[1].TrainAnnouncement;
  console.log(gothenburgTrain);
  gothenburgTrain.forEach((obj) => {
    if (obj.ViaFromLocation) {
      for (const viaFromLocation of obj.ViaFromLocation) {
        if (viaFromLocation.LocationName === "Ör") {
          console.log("Transfer City:", viaFromLocation, obj.AdvertisedTrainIdent);
        }
      }
    }

    if (obj.ViaToLocation) {
      for (const viaToLocation of obj.ViaToLocation) {
        if (viaToLocation.LocationName === "Ör") {
          console.log("Transfer City:", viaToLocation, obj.AdvertisedTrainIdent);
        }
      }
    }
  });
}

// Function Print SJ Train Routes from Malmö
function showTrainRoutes(data) {
  const trainAnnouncement = data.RESPONSE.RESULT[0].TrainAnnouncement;
  const uniqueObjects = {};

  trainAnnouncement.forEach((obj) => {
    uniqueObjects[obj.AdvertisedTrainIdent] = obj;
  });

  // Unique arrays has one announcement for each train number instead of multiple in the original dataset
  const uniqueArray = Object.values(uniqueObjects);
  console.log(uniqueArray);

  const locationNames = [];

  uniqueArray.forEach((entry) => {
    // Extract FromLocation, ViaFromLocation, and ToLocation arrays
    const fromLocations = entry.FromLocation.map(
      (location) => location.LocationName
    );
    const viaFromLocations = entry.ViaFromLocation
      ? entry.ViaFromLocation.map((location) => location.LocationName)
      : [];
    const toLocations = entry.ToLocation.map(
      (location) => location.LocationName
    );

    // Concatenate all location names into one array, with dashes in between
    const allLocations = [
      ...fromLocations,
      ...viaFromLocations,
      ...toLocations,
    ];
    // Add a dash after toLocations if not empty
    if (toLocations.length > 0) {
      allLocations.push("- Train Route");
    }

    // Add the locations to the final array
    locationNames.push(...allLocations);
  });

  console.log(locationNames);

  // Object to keep track of whether function has been called for each city
  const cityCallStatus = {};

  // Loop through the array
  for (let i = 0; i < locationNames.length; i++) {
    const location = locationNames[i];

    // Check if the current location is the specified city and if the function hasn't been called for it yet
    if (location === "G" && !cityCallStatus["G"]) {
      // Call the function
      gothenburg(data);

      // Mark that the function has been called for this city
      cityCallStatus["G"] = true;
      console.log(cityCallStatus);
    }
  }
}

