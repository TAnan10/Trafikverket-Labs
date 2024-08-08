mapboxgl.accessToken = 'pk.eyJ1IjoiZXJrYW40ODEwIiwiYSI6ImNseWMybDk4czBlemcyaXNnY3YxcGN3NWMifQ.NgYCVEbVBHPBNYGGRg28Fg';

async function fetchData(requestBody) {
    const url = "https://api.trafikinfo.trafikverket.se/v2/data.json";
    const headers = {
        "Referer": "http://www.example.com",  // Replace with your domain here
        "Content-Type": "text/xml"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: requestBody
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data); // Debugging log
        return data;
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

function extractCoordinates(wgs84) {
    const coords = wgs84.match(/[-.\d]+/g).map(Number);
    // Ensure the coordinates are ordered as [longitude, latitude]
    return [coords[0], coords[1]];
}

function addMarkers(map, data, markerClass) {
    if (!data || !Array.isArray(data)) {
        console.error('Invalid data:', data); 
        return;
    }

    const features = data
        .filter(item => item.Geometry && item.Geometry.WGS84)
        .map(item => {
            const wgs84 = item.Geometry.WGS84;
            const coordinates = extractCoordinates(wgs84);

            return {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': coordinates
                },
                'properties': {
                    'title': item.AdvertisedLocationName || item.Name || item.Header || 'Unknown',
                    'description': item.AdvertisedLocationName || item.Name || item.Header || 'No description available'
                }
            };
        });

    console.log('Features to be added:', features); 

    for (const feature of features) {
        const el = document.createElement('div');
        el.className = `marker ${markerClass}`;

        new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(
                        `<h3>${feature.properties.title}</h3><p>${feature.properties.description}</p>`
                    )
            )
            .addTo(map);
    }
}

async function fetchAndAddMarkers(map) {
    // Fetch and add train stations
    const trainStationRequest = `<REQUEST>
      <LOGIN authenticationkey="02a306c35ef0407ba3e61c8acfa215e3"/>
      <QUERY objecttype="TrainStation" namespace="rail.infrastructure" schemaversion="1.5" limit="300">
        <FILTER></FILTER>
        <INCLUDE>Geometry.WGS84</INCLUDE>
        <INCLUDE>AdvertisedLocationName</INCLUDE>
      </QUERY>
    </REQUEST>`;
    const trainStationData = await fetchData(trainStationRequest);
    if (trainStationData) {
        addMarkers(map, trainStationData.RESPONSE.RESULT[0].TrainStation, 'train-station');
    }

    // Fetch and add train messages
    const trainMessageRequest = `<REQUEST>
      <LOGIN authenticationkey="02a306c35ef0407ba3e61c8acfa215e3"/>
      <QUERY objecttype="TrainMessage" schemaversion="1.7" limit="300">
        <FILTER></FILTER>
        <INCLUDE>Geometry.WGS84</INCLUDE>
        <INCLUDE>Header</INCLUDE>
      </QUERY>
    </REQUEST>`;
    const trainMessageData = await fetchData(trainMessageRequest);
    if (trainMessageData) {
        addMarkers(map, trainMessageData.RESPONSE.RESULT[0].TrainMessage, 'train-message');
    }

    // Fetch and add ferry routes
    const ferryRouteRequest = `<REQUEST>
      <LOGIN authenticationkey="02a306c35ef0407ba3e61c8acfa215e3"/>
      <QUERY objecttype="FerryRoute" namespace="ferry.trafficinfo" schemaversion="1.2" limit="300">
        <FILTER></FILTER>
        <INCLUDE>Geometry.WGS84</INCLUDE>
        <INCLUDE>Name</INCLUDE>
      </QUERY>
    </REQUEST>`;
    const ferryRouteData = await fetchData(ferryRouteRequest);
    if (ferryRouteData) {
        addMarkers(map, ferryRouteData.RESPONSE.RESULT[0].FerryRoute, 'ferry-route');
    }

    // Fetch and add road conditions
    const roadConditionRequest = `<REQUEST>
      <LOGIN authenticationkey="02a306c35ef0407ba3e61c8acfa215e3"/>
      <QUERY objecttype="RoadCondition" schemaversion="1.2" limit="300">
        <FILTER>
          <EQ name="ConditionCode" value="1"/>
        </FILTER>
        <INCLUDE>Geometry.WGS84</INCLUDE>
        <INCLUDE>ConditionCode</INCLUDE>
        <INCLUDE>Cause</INCLUDE>
        <INCLUDE>Warning</INCLUDE>
        <INCLUDE>RoadNumber</INCLUDE>
      </QUERY>
    </REQUEST>`;
    const roadConditionData = await fetchData(roadConditionRequest);
    if (roadConditionData) {
        addMarkers(map, roadConditionData.RESPONSE.RESULT[0].RoadCondition, 'road-condition');
    }

    // Fetch and add parking spaces
    const parkingRequest = `<REQUEST>
      <LOGIN authenticationkey="02a306c35ef0407ba3e61c8acfa215e3"/>
      <QUERY objecttype="Parking" namespace="road.infrastructure" schemaversion="1.4" limit="300">
        <FILTER>
          <EQ name="TariffsAndPayment.FreeOfCharge" value="true"/>
        </FILTER>
        <INCLUDE>Geometry.WGS84</INCLUDE>
        <INCLUDE>Name</INCLUDE>
        <INCLUDE>Photo.Url</INCLUDE>
        <INCLUDE>UsageSenario</INCLUDE>
        <INCLUDE>VehicleCharacteristics.NumberOfSpaces</INCLUDE>
      </QUERY>
    </REQUEST>`;
    const parkingData = await fetchData(parkingRequest);
    if (parkingData) {
        addMarkers(map, parkingData.RESPONSE.RESULT[0].Parking, 'parking-space');
    }
}

function setupMap(center) {
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 10
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
        fetchAndAddMarkers(map);
    });

    const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken
    });

    map.addControl(directions, 'top-left');
}

function successLocation(position) {
    const center = [position.coords.longitude, position.coords.latitude];
    setupMap(center);
}

function errorLocation() {
    const defaultCenter = [18.0686, 59.3293]; // Default center coordinates (Stockholm)
    setupMap(defaultCenter);
}

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
});
