async function fetchTrainData() {
  const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
  const authenticationKey = "ab40edaaea014a42a5b8ef8ba170aaad";
  const requestBody = `
  <REQUEST>
  <LOGIN authenticationkey="${authenticationKey}"/>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9">
    <FILTER>
      <EQ name="ScheduledDepartureDateTime" value="2024-05-30" />
      <EQ name="TrainOwner" value="SJ" />
      <EQ name="ActivityType" value="Avgang" />
    </FILTER>
    <INCLUDE>ActivityType</INCLUDE>
    <INCLUDE>AdvertisedTrainIdent</INCLUDE>
    <INCLUDE>LocationSignature</INCLUDE>
    <INCLUDE>ScheduledDepartureDateTime</INCLUDE>
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

  data.RESPONSE.RESULT[0].TrainAnnouncement.forEach((announcement) => {
    const row = tableBody.insertRow();

    const activityType = row.insertCell();
    activityType.textContent = announcement.ActivityType;

    const advertisedTrainIdent = row.insertCell();
    advertisedTrainIdent.textContent = announcement.AdvertisedTrainIdent;

    const locationSignature = row.insertCell();
    locationSignature.textContent = announcement.LocationSignature;

    const schedule = row.insertCell();
    schedule.textContent = announcement.ScheduledDepartureDateTime;
  });
}

function trainStation() {
  let searchIcon = document.getElementsByClassName("fa fa-search");

  searchIcon[0].addEventListener("click", () => {
    const searchInput = document
      .getElementById("search-input")
      .value.toLowerCase();

    // Fetch train station data
    fetchTrainData()
      .then((data) => {
        const trainStations = data.RESPONSE.RESULT[1].TrainStation;
        const matchingStations = trainStations.filter((station) =>
          station.AdvertisedLocationName.toLowerCase().includes(searchInput)
        );

        if (matchingStations.length > 0) {
          // console.log("Matching stations found:", matchingStations);

          let shortName = matchingStations[0].LocationSignature;

          const trainAnnouncements = data.RESPONSE.RESULT[0].TrainAnnouncement;

          const tableBody = document
            .getElementById("train-table")
            .getElementsByTagName("tbody")[0];
          tableBody.innerHTML = "";

          trainAnnouncements.forEach((announcement) => {
            if (shortName === announcement.LocationSignature) {
              console.log("Station: ", announcement);

              const tableBody = document
                .getElementById("train-table")
                .getElementsByTagName("tbody")[0];

              const row = tableBody.insertRow();

              const activityType = row.insertCell();
              activityType.textContent = announcement.ActivityType;

              const advertisedTrainIdent = row.insertCell();
              advertisedTrainIdent.textContent =
                announcement.AdvertisedTrainIdent;

              const locationSignature = row.insertCell();
              locationSignature.textContent = announcement.LocationSignature;

              const schedule = row.insertCell();
              schedule.textContent = announcement.ScheduledDepartureDateTime;
            }
          });
        } else {
          console.log("No matching stations found.");
        }
      })
      .catch((error) => console.error("Error fetching train data:", error));
  });
}

trainStation();

fetchTrainData()
  .then((data) => populateTable(data))
  .catch((error) => console.error("Error fetching train data:", error));
