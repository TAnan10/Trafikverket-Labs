const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const axios = require("axios");

const API_KEY = "Replace_with_your_own_key";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public"));

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("close", () => console.log("Client disconnected"));
});

const getTrainPositions = async () => {
  const requestXml = `
    <REQUEST>
      <LOGIN authenticationkey="${API_KEY}"/>
      <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1" limit="50" sseurl="true">
        <FILTER>
          <AND>
            <GT name="Speed" value="70" />
            <EQ name="Status.Active" value="True" />
          </AND>
        </FILTER>
        <INCLUDE>Train.OperationalTrainNumber</INCLUDE>
        <INCLUDE>Position.WGS84</INCLUDE>
        <INCLUDE>Status</INCLUDE>
      </QUERY>
    </REQUEST>
  `;

  try {
    const response = await axios.post(
      "https://api.trafikinfo.trafikverket.se/v2/data.json",
      requestXml,
      {
        headers: { "Content-Type": "text/xml" },
      }
    );

    const positions = response.data.RESPONSE.RESULT[0].TrainPosition || [];
    console.log("Fetched positions:", positions);
    return positions;
  } catch (error) {
    console.error("Error fetching train positions:", error);
    return [];
  }
};

const broadcastTrainPositions = async () => {
  const positions = await getTrainPositions();
  const formattedPositions = positions.map((pos) => {
    const coords = pos.Position.WGS84.match(/POINT \(([^ ]+) ([^ ]+)\)/);
    return {
      trainNumber: pos.Train.OperationalTrainNumber,
      latitude: parseFloat(coords[2]),
      longitude: parseFloat(coords[1]),
    };
  });

  console.log("Broadcasting positions:", formattedPositions);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(formattedPositions));
    }
  });
};

setInterval(broadcastTrainPositions, 500);

server.listen(3000, () => console.log("Server started on port 3000"));
