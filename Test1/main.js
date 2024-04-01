// Request Data
const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const authenticationKey = "ab40edaaea014a42a5b8ef8ba170aaad";

// Check every train in that is departing from malmö
const requestBody = `
<REQUEST>
  <LOGIN authenticationkey="${authenticationKey}"/>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="10">
    <FILTER>
      <EQ name="LocationSignature" value="M" />
    </FILTER>
  </QUERY>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="10">
    <FILTER>
      <EQ name="LocationSignature" value="Ör" />
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
    //console.log(data);
    
    const departuresMalmo = data.RESPONSE.RESULT[0].TrainAnnouncement;
    //console.log(departuresMalmo);
    departuresMalmo.forEach((departure) => {
      if (departure.ActivityType === "Avgang") {
        console.log(departure);
      }
    });

    const departuresOrebro = data.RESPONSE.RESULT[1].TrainAnnouncement;
    //console.log(departuresOrebro);
    departuresOrebro.forEach((departure) => {
      if (departure.ActivityType === "Ankomst") {
        console.log(departure);
      }
    });
    
  })

  .catch((error) => console.error("Error fetching data:", error));
