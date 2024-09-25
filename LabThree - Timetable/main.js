async function fetchTrainData(locationCity) {
  const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
  const authenticationKey = "ab40edaaea014a42a5b8ef8ba170aaad";
  const requestBody = `
    <REQUEST>
      <LOGIN authenticationkey="${authenticationKey}"/>
      <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="15000">
        <FILTER>
          <EQ name="LocationSignature" value="${locationCity}" />
        </FILTER>
        <INCLUDE>ActivityType</INCLUDE>
        <INCLUDE>AdvertisedTrainIdent</INCLUDE>
        <INCLUDE>LocationSignature</INCLUDE>
        <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
      </QUERY>
      <QUERY objecttype="TrainStation" namespace="rail.infrastructure" schemaversion="1.5">
        <FILTER></FILTER>
        <INCLUDE>AdvertisedLocationName</INCLUDE>
        <INCLUDE>LocationSignature</INCLUDE>
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
  return data;
}

function populateTable(data) {
  console.log(data);

  const tableBody = document
    .getElementById("train-table")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = "";

  if (
    data &&
    data.RESPONSE &&
    data.RESPONSE.RESULT &&
    data.RESPONSE.RESULT[0].TrainAnnouncement
  ) {
    data.RESPONSE.RESULT[0].TrainAnnouncement.forEach((announcement) => {
      const row = tableBody.insertRow();

      const activityType = row.insertCell();
      activityType.textContent = announcement.ActivityType;

      const advertisedTrainIdent = row.insertCell();
      advertisedTrainIdent.textContent = announcement.AdvertisedTrainIdent;

      const locationSignature = row.insertCell();
      locationSignature.textContent = announcement.LocationSignature;

      const schedule = row.insertCell();
      schedule.textContent = announcement.AdvertisedTimeAtLocation;
    });
  } else {
    console.log("No train announcements found.");
  }
}

// Initial data fetch for default location "M"
fetchTrainData("G")
  .then((data) => populateTable(data))
  .catch((error) => console.error("Error fetching train data:", error));
