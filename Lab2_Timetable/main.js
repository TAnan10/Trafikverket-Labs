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
      <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1" limit="1000">
        <FILTER>
          <EQ name="Train.JourneyPlanDepartureDate" value="2024-07-11T00:00:00.000+02:00" />
        </FILTER>
        <INCLUDE>Train.OperationalTrainNumber</INCLUDE>
        <INCLUDE>Position</INCLUDE>
        <INCLUDE>Status</INCLUDE>
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

function trainStation() {
  const searchIcon = document.getElementsByClassName("fa fa-search")[0];

  searchIcon.addEventListener("click", () => {
    const searchInput = document
      .getElementById("search-input")
      .value.toLowerCase();

    fetchTrainData()
      .then((data) => {
        const trainStations = data.RESPONSE.RESULT[1].TrainStation;
        const matchingStations = trainStations.filter((station) =>
          station.AdvertisedLocationName.toLowerCase().includes(searchInput)
        );

        if (matchingStations.length > 0) {
          const shortName = matchingStations[0].LocationSignature;
          fetchTrainData(shortName)
            .then((data) => {
              console.log(data);
              const tableBody = document
                .getElementById("train-table")
                .getElementsByTagName("tbody")[0];
              tableBody.innerHTML = "";

              const newData = data.RESPONSE.RESULT[0].TrainAnnouncement;

              newData.forEach((announcement) => {
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
                  locationSignature.textContent =
                    announcement.LocationSignature;

                  const schedule = row.insertCell();
                  schedule.textContent = announcement.AdvertisedTimeAtLocation;
                }
              });
            })
            .catch((error) =>
              console.error(
                "Error fetching train data for searched station:",
                error
              )
            );
        } else {
          console.log("No matching stations found.");
          document
            .getElementById("train-table")
            .getElementsByTagName("tbody")[0].innerHTML =
            "<tr><td colspan='4'>No matching stations found.</td></tr>";
        }
      })
      .catch((error) => console.error("Error fetching train data:", error));
  });
}

function updateTrainData(locationCity) {
  fetchTrainData(locationCity)
    .then((data) => populateTable(data))
    .catch((error) => console.error("Error fetching train data:", error));
}

// Initial data fetch for default location "M"
updateTrainData("M");

// Update train data every 60 seconds (60000 milliseconds) for the current location
setInterval(() => {
  const searchInput = document
    .getElementById("search-input")
    .value.toLowerCase();
  fetchTrainData()
    .then((data) => {
      const trainStations = data.RESPONSE.RESULT[1].TrainStation;
      const matchingStations = trainStations.filter((station) =>
        station.AdvertisedLocationName.toLowerCase().includes(searchInput)
      );

      if (matchingStations.length > 0) {
        const shortName = matchingStations[0].LocationSignature;
        updateTrainData(shortName);
        trainStation();
      } else {
        console.log("No matching stations found.");
      }
    })
    .catch((error) =>
      console.error("Error fetching train data for update:", error)
    );
}, 60000);

trainStation();
