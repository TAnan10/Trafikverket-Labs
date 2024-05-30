async function fetchTrainData() {
  const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
  const authenticationKey = "ab40edaaea014a42a5b8ef8ba170aaad";
  const requestBody = `
<REQUEST>
  <LOGIN authenticationkey="${authenticationKey}"/>
  <QUERY objecttype="TrainAnnouncement" schemaversion="1.9" limit="10">
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
  return data;
}

function populateTable(data) {
  console.log(data);
  const tableBody = document
    .getElementById("train-table")
    .getElementsByTagName("tbody")[0];

  data.RESPONSE.RESULT[0].TrainAnnouncement.forEach((announcement) => {
    const row = tableBody.insertRow();

    const activityIdCell = row.insertCell();
    activityIdCell.textContent = announcement.ActivityId;

    const activityType = row.insertCell();
    activityType.textContent = announcement.ActivityType;

    const advertised = row.insertCell();
    advertised.textContent = announcement.Advertised;

    const advertisedTrainIdent = row.insertCell();
    advertisedTrainIdent.textContent = announcement.AdvertisedTrainIdent;
  });
}

fetchTrainData()
  .then((data) => populateTable(data))
  .catch((error) => console.error("Error fetching train data:", error));
