let mainTrainStationData = [];

// Retrieve train station coordinates of Skåne county
async function GetTrainStationCoordinates() {
  const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
  const API_KEY = "Replace_with_your_own_key";
  const requestBody = `
    <REQUEST>
    <LOGIN authenticationkey="${API_KEY}"/>
    <QUERY objecttype="TrainStation" namespace="rail.infrastructure" schemaversion="1.5">
      <FILTER>
        <EQ name="CountyNo" value="12" />
      </FILTER>
      <INCLUDE>AdvertisedShortLocationName</INCLUDE>
      <INCLUDE>LocationSignature</INCLUDE>
      <INCLUDE>Geometry.WGS84</INCLUDE>
      <INCLUDE>CountyNo</INCLUDE>
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

async function TrainStationCoordinates() {
  try {
    const data = await GetTrainStationCoordinates();
    const onlyStationDataStart = data.RESPONSE.RESULT[0].TrainStation;
    const sortedDataAlphabetically = onlyStationDataStart.sort((a, b) => {
      return a.AdvertisedShortLocationName.localeCompare(
        b.AdvertisedShortLocationName
      );
    });

    mainTrainStationData = sortedDataAlphabetically.map((station) => {
      const trimmedString = station.Geometry.WGS84.replace(
        "POINT (",
        ""
      ).replace(")", "");
      const [lng, lat] = trimmedString.split(" ").map(Number);

      return {
        name: station.AdvertisedShortLocationName,
        lat: lat,
        lng: lng,
      };
    });

    console.log(mainTrainStationData);
  } catch (error) {
    console.error("Error fetching train station data:", error);
  }
}

let stations = [
  { name: "Malmö", lat: 55.6052931, lng: 13.0001566 },
  { name: "Triangeln", lat: 55.5932748, lng: 13.0010372 },
  { name: "Hyllie", lat: 55.5627506, lng: 12.9758747 },
  { name: "Svågertorp", lat: 55.5504286, lng: 12.9914179 },
  { name: "Östervärn", lat: 55.6078691, lng: 13.0315018 },
  { name: "Rosengård", lat: 55.5888929, lng: 13.0307937 },
  { name: "Persborg", lat: 55.58062, lng: 13.0293366 },
  { name: "Oxie", lat: 55.5461572, lng: 13.0967868 },
  { name: "Svedala", lat: 55.5513434, lng: 13.216676 },
  { name: "Skurup", lat: 55.4815088, lng: 13.554477 },
];

// Define connections (edges) with travel times (in minutes)
const connections = [
  { source: "Malmö", target: "Lomma", time: 8 },
  { source: "Malmö", target: "Burlöv", time: 5 },
  { source: "Malmö", target: "Östervärn", time: 4 },
  { source: "Malmö", target: "Triangeln", time: 3 },
  { source: "Triangeln", target: "Hyllie", time: 4 },
  { source: "Hyllie", target: "Svågertorp", time: 5 },
  { source: "Svågertorp", target: "Oxie", time: 9 },
  { source: "Oxie", target: "Svedala", time: 9 },
  { source: "Svedala", target: "Skurup", time: 11 },
  { source: "Skurup", target: "Rydsgård", time: 5 },
  { source: "Rydsgård", target: "Svarte", time: 7 },
  { source: "Svarte", target: "Ystad", time: 11 },
  { source: "Ystad", target: "Köpingebro", time: 6 },
  { source: "Köpingebro", target: "Tomelilla", time: 7 },
  { source: "Tomelilla", target: "Lunnarp", time: 5 },
  { source: "Lunnarp", target: "Smedstorp", time: 4 },
  { source: "Smedstorp", target: "Gärsnäs", time: 4 },
  { source: "Gärsnäs", target: "Simrishamn", time: 9 },
  { source: "Östervärn", target: "Rosengård", time: 2 },
  { source: "Rosengård", target: "Persborg", time: 2 },
  { source: "Persborg", target: "Svågertorp", time: 6 },
  { source: "Burlöv", target: "Åkarp", time: 3 },
  { source: "Svågertorp", target: "V. Ingelstad", time: 6 },
  { source: "V. Ingelstad", target: "Ö. Grevie", time: 4 },
  { source: "Ö. Grevie", target: "Trelleborg", time: 13 },

  { source: "Åkarp", target: "Hjärup", time: 8 },
  { source: "Hjärup", target: "Klostergården", time: 5 },
  { source: "Klostergården", target: "Lund", time: 4 },
  { source: "Lund", target: "Stångby", time: 3 },
  { source: "Stångby", target: "Örtofta", time: 4 },
  { source: "Örtofta", target: "Eslöv", time: 5 },
  { source: "Eslöv", target: "Stehag", time: 9 },
  { source: "Eslöv", target: "Marieholm", time: 9 },
  { source: "Stehag", target: "Höör", time: 11 },
  { source: "Höör", target: "Tjörnarp", time: 5 },
  { source: "Tjörnarp", target: "Sösdala", time: 7 },
  { source: "Sösdala", target: "Hässleholm", time: 11 },
  { source: "Hässleholm", target: "Tyringe", time: 6 },
  { source: "Hässleholm", target: "Bjärnum", time: 7 },
  { source: "Hässleholm", target: "Ballingslöv", time: 5 },
  { source: "Hässleholm", target: "Vinslöv", time: 4 },
  { source: "Ballingslöv", target: "Hästveda", time: 4 },
  { source: "Hästveda", target: "Osby", time: 9 },
  { source: "Osby", target: "Killeberg", time: 2 },
  { source: "Killeberg", target: "Älmhult", time: 2 },
  { source: "Vinslöv", target: "Önnestad", time: 6 },
  { source: "Önnestad", target: "Kristianstad", time: 3 },
  { source: "Kristianstad", target: "Fjälkinge", time: 6 },
  { source: "Fjälkinge", target: "Bromölla", time: 4 },
  { source: "Bromölla", target: "Sölvesborg", time: 13 },
  { source: "Sölvesborg", target: "Mörrum", time: 4 },
  { source: "Mörrum", target: "Karlshamn", time: 13 },

  { source: "Bjärnum", target: "Vittsjö", time: 2 },
  { source: "Vittsjö", target: "Markaryd", time: 2 },

  { source: "Tyringe", target: "Perstorp", time: 8 },
  { source: "Perstorp", target: "Klippan", time: 5 },
  { source: "Klippan", target: "Kvidinge", time: 4 },
  { source: "Kvidinge", target: "Åstorp", time: 3 },
  { source: "Åstorp", target: "Bjuv", time: 4 },
  { source: "Bjuv", target: "Mörarp", time: 5 },
  { source: "Mörarp", target: "Påarp", time: 9 },
  { source: "Påarp", target: "Ramlösa", time: 9 },
  { source: "Ramlösa", target: "Helsingborg", time: 11 },
  { source: "Helsingborg", target: "Maria", time: 5 },
  { source: "Maria", target: "Ödåkra", time: 7 },
  { source: "Ödåkra", target: "Kattarp", time: 11 },
  { source: "Kattarp", target: "Ängelholm", time: 6 },
  { source: "Ängelholm", target: "Barkåkra", time: 7 },
  { source: "Barkåkra", target: "Förslöv", time: 5 },
  { source: "Förslöv", target: "Båstad", time: 4 },
  { source: "Båstad", target: "Laholm", time: 4 },
  { source: "Laholm", target: "Halmstad", time: 9 },

  { source: "Lomma", target: "Furulund", time: 2 },
  { source: "Furulund", target: "Kävlinge", time: 2 },
  { source: "Kävlinge", target: "Gunnesbo", time: 6 },
  { source: "Kävlinge", target: "Teckomatorp", time: 3 },
  { source: "Kävlinge", target: "Dösjebro", time: 6 },
  { source: "Teckomatorp", target: "Marieholm", time: 6 },
  { source: "Gunnesbo", target: "Lund", time: 4 },
  { source: "Teckomatorp", target: "Svalöv", time: 13 },
  { source: "Svalöv", target: "Kågeröd", time: 4 },
  { source: "Kågeröd", target: "Billesholm", time: 13 },
  { source: "Billesholm", target: "Åstorp", time: 13 },

  { source: "Dösjebro", target: "Häljarp", time: 5 },
  { source: "Häljarp", target: "Landskrona", time: 9 },
  { source: "Landskrona", target: "Glumslöv", time: 9 },
  { source: "Glumslöv", target: "Rydebäck", time: 11 },
  { source: "Rydebäck", target: "Ramlösa", time: 5 },
  { source: "Teckomatorp", target: "Billeberga", time: 7 },
  { source: "Billeberga", target: "Tågarp", time: 11 },
  { source: "Tågarp", target: "Vallåkra", time: 6 },
  { source: "Vallåkra", target: "Gantofta", time: 7 },
  { source: "Gantofta", target: "Ramlösa", time: 5 },
  { source: "Förslöv", target: "Båstad", time: 4 },
  { source: "Båstad", target: "Laholm", time: 4 },
  { source: "Laholm", target: "Halmstad", time: 9 },
];

let markersVisible = true; // Track the visibility state

// Create map
async function initMap() {
  await TrainStationCoordinates();

  const position = { lat: 55.58749884271097, lng: 13.103699971962222 };
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  map = new Map(document.getElementById("map"), {
    zoom: 11,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  try {
    // Create map for station names to markers
    const stationMap = {};
    const markers = []; // Array to store markers

    // Create markers for each station
    for (const station of mainTrainStationData) {
      const { name, lat, lng } = station;
      const img = document.createElement("img");
      img.src = "train-station.png";
      const contentString = `
      <div>
        <p><strong>Station Name:</strong> ${name}</p>
        <p><strong>Coordinates:</strong> ${lat}, ${lng}</p>
      </div>
      `;
      const infoWindow = new google.maps.InfoWindow({
        content: contentString,
      });

      const marker = new AdvancedMarkerElement({
        position: { lat, lng },
        map: map,
        title: name,
        content: img,
      });

      // Store the lat and lng in the marker object
      marker.lat = lat;
      marker.lng = lng;

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      stationMap[name] = marker;
      markers.push(marker); // Add marker to the array
    }

    // Handle toggle button click
    const toggleButton = document.getElementById("toggleMarkersBtn");
    toggleButton.addEventListener("click", () => {
      markersVisible = !markersVisible; // Toggle the state
      markers.forEach((marker) => {
        marker.setMap(markersVisible ? map : null);
      });
      toggleButton.textContent = markersVisible
        ? "Hide Markers"
        : "Show Markers";
    });

    // Create polylines between connected stations
    connections.forEach((connection) => {
      const sourceMarker = stationMap[connection.source];
      const targetMarker = stationMap[connection.target];

      if (sourceMarker && targetMarker) {
        const line = new google.maps.Polyline({
          path: [
            {
              lat: sourceMarker.lat,
              lng: sourceMarker.lng,
            },
            {
              lat: targetMarker.lat,
              lng: targetMarker.lng,
            },
          ],
          geodesic: true,
          strokeColor: "#FF0000", // Red color for connections
          strokeOpacity: 1.0,
          strokeWeight: 5,
          map: map,
          zIndex: 1, // Set lower zIndex for red lines
        });

        google.maps.event.addListener(line, "click", function () {
          new google.maps.InfoWindow({
            content: `Travel time: ${connection.time} minutes`,
          }).open(map, sourceMarker);
        });
      } else {
        console.error("Marker not found for connection:", connection);
      }
    });

    const start = mainTrainStationData.find(
      (station) => station.name === "Malmö"
    );
    const goal = mainTrainStationData.find(
      (station) => station.name === "Hässleholm"
    );

    const path = await aStarSearch(
      start,
      goal,
      mainTrainStationData,
      connections
    );
    if (path) {
      showFinalPath(path);
    } else {
      console.log("No path found");
    }
  } catch (error) {
    console.error("Error processing data:", error);
  }
}

// A* Algorithm
async function aStarSearch(start, goal, nodes, connections) {
  const openSet = [start];
  const cameFrom = {};

  const gScore = {};
  const fScore = {};

  nodes.forEach((node) => {
    gScore[node.name] = Infinity;
    fScore[node.name] = Infinity;
  });

  gScore[start.name] = 0;
  fScore[start.name] = haversineDistance(start, goal);

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore[a.name] - fScore[b.name]);
    const current = openSet.shift();

    if (current.name === goal.name) {
      return reconstructPath(cameFrom, current);
    }

    const currentConnections = connections.filter(
      (conn) => conn.source === current.name
    );
    for (const connection of currentConnections) {
      const neighbor = nodes.find((node) => node.name === connection.target);
      const tentativeGScore = gScore[current.name] + connection.time;

      if (tentativeGScore < gScore[neighbor.name]) {
        cameFrom[neighbor.name] = current;
        gScore[neighbor.name] = tentativeGScore;
        fScore[neighbor.name] =
          gScore[neighbor.name] + haversineDistance(neighbor, goal);

        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }

      // Update visualization for A* search paths
      visualizePath(current, neighbor, "#0000FF", 2); // Blue paths for search with zIndex
      await new Promise((resolve) => setTimeout(resolve, 300)); // Add delay for visualization
    }
  }

  return null; // No path found
}

function reconstructPath(cameFrom, current) {
  const totalPath = [current];
  while (current.name in cameFrom) {
    current = cameFrom[current.name];
    totalPath.push(current);
  }
  return totalPath.reverse();
}

function visualizePath(current, neighbor, color, zIndexValue = 2) {
  const line = new google.maps.Polyline({
    path: [
      { lat: current.lat, lng: current.lng },
      { lat: neighbor.lat, lng: neighbor.lng },
    ],
    geodesic: true,
    strokeColor: color, // Color passed as argument
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map,
    zIndex: zIndexValue, // Custom zIndex for layers
  });
}

function showFinalPath(path) {
  path.forEach((node, index) => {
    if (index < path.length - 1) {
      const nextNode = path[index + 1];
      visualizePath(node, nextNode, "#00FF00", 3); // Green with higher zIndex
    }
  });
}

// Calculate H Value
function haversineDistance(coord1, coord2) {
  const R = 6371; // Radius of the Earth in km
  const lat1 = (coord1.lat * Math.PI) / 180;
  const lat2 = (coord2.lat * Math.PI) / 180;
  const deltaLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const deltaLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Call initMap to initialize the map
initMap();
