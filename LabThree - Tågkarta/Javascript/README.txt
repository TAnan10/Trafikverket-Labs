# Live Train Map

## Overview

This project provides a real-time map visualization of train positions using a Node.js server and WebSocket for live updates. The positions of active trains with a speed greater than 70 km/h are fetched from Trafikverkets API and displayed on a map using Leaflet.js.

## Components

1. **server.js**: A Node.js server using Express and WebSocket to fetch train positions from an API and broadcast updates to connected clients.
2. **index.html**: An HTML file that uses Leaflet.js to visualize the train positions on a map and updates the map in real-time using WebSocket.

## Prerequisites

Before running the server, ensure you have Node.js and npm installed. You will also need to install the required npm packages:

----------------------------
npm install express ws axios
----------------------------

## Setup

1. **Configure API Key**: Update the `API_KEY` variable in `server.js` with your API key to access the train data from Trafikverkets API.

    ------------------------------------
    const API_KEY = "YOUR_API_KEY_HERE";
    ------------------------------------

2. **Run the Server**: Start the Node.js server by executing the following command in the terminal:

    --------------
    node server.js
    --------------

    - The server will start on port 3000.
    - It will fetch train positions every 30 seconds and broadcast them to connected WebSocket clients.

3. **Open the Map**: Open `index.html` in your web browser to see the live map with train positions.

## File Descriptions

1. **server.js**:
    - **Dependencies**: `express`, `http`, `ws`, `axios`
    - **Functionality**:
      - Sets up an HTTP server and a WebSocket server.
      - Periodically fetches train positions from Trafikverkets API.
      - Broadcasts the positions to all connected WebSocket clients.
    - **Endpoints**:
      - Serves static files from the `public` directory (where `index.html` should be placed).

2. **index.html**:
    - **Libraries**: Leaflet.js for map rendering.
    - **Functionality**:
      - Connects to the WebSocket server at `ws://localhost:3000`.
      - Updates the map with train positions received from the WebSocket server.
      - Uses Leaflet.js to display markers for each train.

## Example Usage

1. **Start the Server**:
    --------------
    node server.js
    --------------

2. **Open the HTML File**:
    - Open `index.html` in a web browser.

3. **View Train Positions**:
    - The map will update in real-time with train positions.

## Troubleshooting

- **API Key Issues**: Ensure the API key is valid and correctly set in `server.js`.
- **Server Errors**: Check the console output for errors related to fetching train positions or WebSocket connections.
- **Map Not Updating**: Verify that the WebSocket connection is established and receiving data.