async function TrafficData() {
  const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
  const authenticationKey = Trafikverket_API_KEY;
  const requestBody = `
  <REQUEST>
  <LOGIN authenticationkey="${authenticationKey}"/>
    <QUERY objecttype="Parking" namespace="road.infrastructure" schemaversion="1.4">
      <FILTER></FILTER>
    </QUERY>
    <QUERY objecttype="Camera" schemaversion="1">
      <FILTER><EQ name="Type" value="Trafikflödeskamera" /></FILTER>
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

let map;

// Create the map
async function initMap() {
  const position = { lat: 57.7089, lng: 11.9746 };
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    zoom: 8,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  const directionsRenderer = new google.maps.DirectionsRenderer();
  const directionsService = new google.maps.DirectionsService();

  // Fetch traffic data
  const data = await TrafficData();
  console.log(data);

  // Define icons for different types of data
  const restPlaceIcon = "picnic.png";
  const trafficCamera = "./Images/traffic-lights.png";

  /*
  // Add Rest Place Markers
  const parkingLocations = data.RESPONSE.RESULT[0].Parking;
  parkingLocations.forEach((location) => {
    const coordinates = location.Geometry.WGS84;
    const { lat, lng } = parsePoint(coordinates);
    addMarker({ lat, lng }, restPlaceIcon);
  });
  */

  // Add camera markers
  const cameraLocations = data.RESPONSE.RESULT[1].Camera;
  cameraLocations.forEach((location) => {
    const camCoordinates = location.Geometry.WGS84;
    const { lat, lng } = parsePoint(camCoordinates);
    addMarker({ lat, lng }, trafficCamera);
  });

  directionsRenderer.setMap(map);
  displayRoute(directionsService, directionsRenderer, cameraLocations);
  document.getElementById("mode").addEventListener("change", () => {
    displayRoute(directionsService, directionsRenderer, cameraLocations);
  });
}

function displayRoute(directionsService, directionsRenderer, cameraLocations) {
  const selectedMode = document.getElementById("mode").value;
  const pathImg = "road.png";
  const distanceThreshold = 50; // Distance threshold in meters
  let camerasOnRouteCount = 0;
  const matchedCameras = new Set();
  const newTrafficCam = "./Images/traffic-light (1).png";

  directionsService
    .route({
      origin: document.getElementById("from").value,
      destination: document.getElementById("to").value,
      provideRouteAlternatives: true,
      travelMode: google.maps.TravelMode[selectedMode],
    })
    .then((response) => {
      const allPathCoordinates = [];
      console.log(response);
      response.routes.forEach((route) => {
        route.legs[0].steps.forEach((step, stepIndex) => {
          step.path.forEach((latLng, pathIndex) => {
            const lat = latLng.lat();
            const lng = latLng.lng();
            allPathCoordinates.push({ lat, lng, stepIndex, pathIndex });
            // Add a marker for the path point
            // addMarker({ lat, lng }, pathImg);
          });
        });
      });

      // Filter cameras based on longitude range
      const filteredCameraLocations = cameraLocations.filter((location) => {
        const camCoordinates = location.Geometry.WGS84;
        const { lat, lng } = parsePoint(camCoordinates);
        return lng >= 11 && lng <= 14; // Adjust the range as needed
      });

      console.log(`Filtered cameras: ${filteredCameraLocations.length}`);

      // Compare path coordinates with filtered camera coordinates
      filteredCameraLocations.forEach((location) => {
        const camCoordinates = location.Geometry.WGS84;
        const { lat, lng } = parsePoint(camCoordinates);
        const camKey = `${lat},${lng}`;

        allPathCoordinates.forEach((pathCoord) => {
          const distance = calculateDistance(
            pathCoord.lat,
            pathCoord.lng,
            lat,
            lng
          );

          if (distance <= distanceThreshold) {
            if (!matchedCameras.has(camKey)) {
              camerasOnRouteCount++;
              matchedCameras.add(camKey);
              console.log(`Match ${camerasOnRouteCount}:`);
              console.log(`  Camera at: ${lat}, ${lng}`);
              console.log(
                `  Path segment at: ${pathCoord.lat}, ${pathCoord.lng} (Step: ${pathCoord.stepIndex}, Path: ${pathCoord.pathIndex})`
              );
              addMarker({ lat, lng }, newTrafficCam);
              document.getElementById(
                "cameraCount"
              ).innerText = `Number of cameras on the route: ${camerasOnRouteCount}`;
            }
          }
        });
      });

      console.log(allPathCoordinates);
      console.log(`Number of cameras on the route: ${camerasOnRouteCount}`);

      // Clear previous routes
      renderers.forEach((renderer) => renderer.setMap(null));
      renderers = [];

      // Display each route with a different color
      const colors = ["blue", "green", "red", "purple", "orange"];
      response.routes.forEach((route, i) => {
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: map,
          directions: response,
          routeIndex: i,
          polylineOptions: {
            strokeColor: colors[i % colors.length],
          },
        });
        renderers.push(directionsRenderer);
      });
    })
    .catch((e) => window.alert("Direction request failed due to " + error));
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius of the Earth in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  return distance;
}

// Create markers
async function addMarker(location, iconUrl) {
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // Create an img element for the custom icon
  const img = document.createElement("img");
  img.src = iconUrl;

  const { lat, lng } = location;

  const infoWindow = new google.maps.InfoWindow();

  // Marker
  const marker = new AdvancedMarkerElement({
    map: map,
    position: { lat, lng },
    content: img,
    title: "Cam",
    gmpClickable: true,
  });

  marker.addListener("click", () => {
    // Open the info window on marker click
    infoWindow.setContent(`Coordinates ${lat}, ${lng}`);
    infoWindow.open(map, marker);
  });
}

let renderers = [];

initMap();

// Parse JSON Coordinates
function parsePoint(pointString) {
  const trimmedString = pointString.replace("POINT (", "").replace(")", "");
  const [lng, lat] = trimmedString.split(" ").map(Number);
  return { lat, lng };
}
