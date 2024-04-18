// Request Data
const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
const authenticationKey = "ab40edaaea014a42a5b8ef8ba170aaad";
const requestBody = `
<REQUEST>
  <LOGIN authenticationkey="ab40edaaea014a42a5b8ef8ba170aaad"/>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="1">
    <FILTER>
      <EQ name="LocationSignature" value="M" />
      <EQ name="ToLocation.LocationName" value="G" />
    </FILTER>
    <INCLUDE>LocationSignature</INCLUDE>
    <INCLUDE>AdvertisedTrainIdent</INCLUDE>
    <INCLUDE>ToLocation.LocationName</INCLUDE>
    <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
  </QUERY>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="1">
    <FILTER>
      <EQ name="LocationSignature" value="G" />
      <EQ name="AdvertisedTrainIdent" value="1074" />
      <EQ name="OperationalTransportIdentifiers.StartDate" value="2024-04-15" />
    </FILTER>
    <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
    <INCLUDE>AdvertisedTrainIdent</INCLUDE>
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
    const trainData = data.RESPONSE.RESULT[0].TrainAnnouncement;
    const trainData2 = data.RESPONSE.RESULT[1].TrainAnnouncement;

    // Assuming the rest of your code is the same up to this point

    trainData.forEach((element1) => {
      const time1 = new Date(element1.AdvertisedTimeAtLocation);
      trainData2.forEach((element2) => {
        const time2 = new Date(element2.AdvertisedTimeAtLocation);

        // Calculate the difference in milliseconds
        const differenceInMilliseconds = time2 - time1;

        // Convert the difference to minutes
        const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

        console.log("The difference is:", differenceInMinutes, "minutes");
      });
    });
  })

  .catch((error) => console.error("Error fetching data:", error));


  