async function TrafficData() {
  const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
  const authenticationKey = Trafikverket_API_KEY;
  const requestBody = `
  <REQUEST>
  <LOGIN authenticationkey="${authenticationKey}"/>
    <QUERY objecttype="Situation" schemaversion="1.5">
      <FILTER></FILTER>
      <INCLUDE>Deviation.Geometry.Point.WGS84</INCLUDE>
      <INCLUDE>Deviation.CountyNo</INCLUDE>
      <INCLUDE>Deviation.RoadNumber</INCLUDE>
      <INCLUDE>Deviation.MessageType</INCLUDE>
      <INCLUDE>Deviation.IconId</INCLUDE>
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

const roadworkImg = "roadwork.png";

async function printRoadData() {
  const roadData = await TrafficData();
  console.log(roadData);
  const trafficFlowArray = roadData.RESPONSE.RESULT[0].Situation;
  searchData.push(trafficFlowArray);

  // Loop through the trafficFlowArray to get the county numbers and add markers
  trafficFlowArray.forEach((road) => {
    const coordinates = road.Deviation[0].Geometry.Point.WGS84;
    const coord = parsePoint(coordinates);
    const CountyNo = road.Deviation[0].CountyNo;
    const messageType = road.Deviation[0].MessageType; // Check the message type
    addMarker(coord, messageType, roadworkImg); // Pass messageType to addMarker
    data.push(`CountyNo ${CountyNo}`);
  });

  // Remove duplicates
  const uniqueData = Array.from(new Set(data));
  data.length = 0; // Clear the original array
  data.push(...uniqueData); // Refill with unique data
}

printRoadData();

function parsePoint(pointString) {
  const trimmedString = pointString.replace("POINT (", "").replace(")", "");
  const [lng, lat] = trimmedString.split(" ").map(Number);
  return { lat, lng };
}

const searchData = [];
const data = [];

// Function to count roadworks by county number
function countRoadworksByCounty(countyNo) {
  let count = 0;
  searchData.forEach((roadwork) => {
    roadwork.forEach((element) => {
      if (element.Deviation[0].CountyNo == countyNo) {
        count++;
      }
    });
  });
  return count;
}

const countyCoordinates = {
  10: { lat: 56.2795, lng: 15.1195 },
  20: { lat: 60.9686, lng: 14.4612 },
  21: { lat: 61.3014, lng: 16.1538 },
  9: { lat: 57.4689, lng: 18.4873 },
  13: { lat: 56.8906, lng: 12.8207 },
  23: { lat: 63.1368, lng: 14.8678 },
  6: { lat: 57.5222, lng: 14.1445 },
  8: { lat: 57.2071, lng: 16.3277 },
  7: { lat: 56.7239, lng: 14.1702 },
  25: { lat: 66.8295, lng: 20.3998 },
  18: { lat: 59.2737, lng: 15.2134 },
  5: { lat: 58.4111, lng: 15.6214 },
  12: { lat: 55.9903, lng: 13.5953 },
  4: { lat: 59.1955, lng: 16.3703 },
  1: { lat: 59.3293, lng: 18.0686 },
  3: { lat: 60.0042, lng: 17.0717 },
  17: { lat: 59.7031, lng: 13.085 },
  24: { lat: 64.1775, lng: 19.3317 },
  22: { lat: 63.1506, lng: 17.8376 },
  19: { lat: 59.6715, lng: 16.2159 },
  14: { lat: 58.2822, lng: 12.0184 },
};

// Function to handle search and count roadworks in the specified county
function handleSearch(query) {
  console.log("Search initiated for:", query);
  const countyNo = parseInt(query.split(" ")[1], 10);
  const roadworkCount = countRoadworksByCounty(countyNo);
  console.log(`CountyNo ${countyNo} has ${roadworkCount} roadworks.`);
  // Display the count to the user
  document.getElementById(
    "result"
  ).innerText = `Result: CountyNo ${countyNo} has ${roadworkCount} roadworks.`;

  // Check if the county coordinates exist
  if (countyCoordinates[countyNo]) {
    // Get the coordinates and update the map's center and zoom level
    const newCenter = countyCoordinates[countyNo];
    map.setCenter(newCenter);
    map.setZoom(8); // Set a desired zoom level, adjust as needed
  } else {
    console.warn(`Coordinates not found for CountyNo ${countyNo}`);
  }
}

document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase();
  const suggestionsBox = document.getElementById("suggestions");

  // Clear previous suggestions
  suggestionsBox.innerHTML = "";

  if (query.length > 0) {
    // Filter the data based on the query
    const filteredData = data.filter((item) =>
      item.toLowerCase().includes(query)
    );

    // Display the suggestions
    filteredData.forEach((item) => {
      const suggestionDiv = document.createElement("div");
      suggestionDiv.textContent = item;
      suggestionDiv.addEventListener("click", function () {
        document.getElementById("searchInput").value = item;
        suggestionsBox.innerHTML = "";
        handleSearch(item); // Call the function with the selected item
      });
      suggestionsBox.appendChild(suggestionDiv);
    });
  }
});

document
  .getElementById("searchInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission if in a form
      const query = this.value.trim();
      if (query.length > 0) {
        handleSearch(query); // Call the function with the input value
      }
    }
  });

// Optionally, close the suggestions box if the user clicks outside of it
document.addEventListener("click", function (event) {
  if (!event.target.closest(".search-container")) {
    document.getElementById("suggestions").innerHTML = "";
  }
});

// Initialize and add the map
let map;

async function initMap() {
  // The location of Gothenburg
  const position = { lat: 57.7089, lng: 11.9746 };
  const { Map } = await google.maps.importLibrary("maps");

  // The map, centered at Gothenburg
  map = new Map(document.getElementById("map"), {
    zoom: 11,
    center: position,
    mapId: "DEMO_MAP_ID",
  });
}

// Create markers with custom icons for roadwork
async function addMarker(location, messageType, iconUrl) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const { lat, lng } = location;
  const infoWindow = new google.maps.InfoWindow();

  const img = document.createElement("img");
  img.src = iconUrl;

  // Marker
  const marker = new AdvancedMarkerElement({
    map: map,
    position: { lat, lng },
    content: img,
    gmpClickable: true,
  });

  marker.addListener("click", () => {
    // Open the info window on marker click
    infoWindow.setContent(`Coordinates ${lat}, ${lng}`);
    infoWindow.open(map, marker);
  });
}

initMap();
