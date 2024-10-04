# Mapbox Markers Application

## Overview

This project uses Mapbox GL JS to visualize various types of geographic data on a map. The application fetches data such as train stations, train messages, ferry routes, road conditions, and parking spaces from Trafikverkets open API, and displays this information as markers on the map. It also allows for navigation with Mapbox Directions.

## Components

1. **fetch-coordinates.js**: JavaScript file that handles fetching geographic data from an API, processing it, and adding markers to the Mapbox map.
2. **index.html**: HTML file that sets up the map using Mapbox GL JS and includes necessary styles and scripts.

## Prerequisites

1. **Mapbox Access Token**: You need a valid Mapbox access token. Replace the existing token in `fetch-coordinates.js` with your own token.

2. **API Key**: Replace the placeholder API key in `fetch-coordinates.js` with your actual API key for accessing the geographic data.

## Setup

1. **Replace API Key and Mapbox Token**:
    - Open `fetch-coordinates.js` and update the `mapboxgl.accessToken` with your Mapbox access token.
    - Replace `authenticationkey` in the request XMLs with your API key from Trafikverkets open API.

    -------------------------------------------------------
    mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';
    -------------------------------------------------------

    ---------------------------------------------------
    const trainStationRequest = `<REQUEST>
      <LOGIN authenticationkey="YOUR_API_KEY_HERE"/>
      ...
    </REQUEST>`;
    ---------------------------------------------------

2. **Host the Files**:
    - Ensure both `fetch-coordinates.js` and `index.html` are in the same directory.
    - Open `index.html` in a web browser to see the application in action.

## Usage

1. **Load the Map**:
    - Open `index.html` in a web browser. The map will be centered on the user's current location if location access is granted; otherwise, it will center on Stockholm, Sweden.

2. **View Data**:
    - The map will display markers for train stations, train messages, ferry routes, road conditions, and parking spaces.
    - Markers are styled based on their type and will display additional information in popups when clicked.

3. **Navigate**:
    - The map includes a navigation control allowing users to get directions.

## Features

- **Dynamic Data Fetching**: Data is fetched from the API and displayed as markers on the map.
- **Mapbox Directions**: Provides navigation functionality.
- **Responsive Design**: The map is responsive and will adjust to the size of the viewport.

## Troubleshooting

- **API Key Issues**: Ensure that your API key and Mapbox access token are valid and correctly inserted in `fetch-coordinates.js`.
- **Data Not Displaying**: Check the browser console for any errors related to data fetching or marker creation.
- **Map Not Loading**: Verify that Mapbox scripts are correctly included and your access token is valid.