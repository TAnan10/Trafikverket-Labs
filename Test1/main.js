// Request Data
const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const authenticationKey = "ab40edaaea014a42a5b8ef8ba170aaad";
const requestBody = `
<REQUEST>
  <LOGIN authenticationkey="${authenticationKey}"/>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9">
    <FILTER>
      <EQ name="LocationSignature" value="G" />
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
    console.log(data);
    const departuresOrebro = data.RESPONSE.RESULT[0].TrainAnnouncement;
    departuresOrebro.forEach((departure) => {
      if (departure.ToLocation[0].LocationName === "Ör") {
        const stations = departure.ViaToLocation;
        stations.forEach((station) => {
          const locName = station.LocationName;
          getFullLocationName(locName);
        })
      }
    });

    function getFullLocationName(shortName) {
      const trainStations = data.RESPONSE.RESULT[1].TrainStation;
      trainStations.forEach((station) => {
        if (station.LocationSignature === shortName) {
          console.log(`${station.LocationSignature} = ${station.AdvertisedLocationName}`);
        }
      })
    }

  })
  
  .catch((error) => console.error("Error fetching data:", error));