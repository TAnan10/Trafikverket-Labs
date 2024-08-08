const axios = require('axios');
const EventSource = require('eventsource');
const readline = require('readline');

const authenticationKey = 'd68896103a8141a186a79910d41ce683';  // Replace with your real key
const requestJson = `
<REQUEST>
    <LOGIN authenticationkey="${authenticationKey}" />
    <QUERY sseurl="true" objecttype="TrainAnnouncement" orderby="AdvertisedTimeAtLocation" schemaversion="1.3" limit="10">
        <FILTER>
            <AND>
            </AND>
        </FILTER>
        <INCLUDE>AdvertisedTrainIdent</INCLUDE>
        <INCLUDE>ActivityType</INCLUDE>
        <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
        <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
        <INCLUDE>LocationSignature</INCLUDE>
        <INCLUDE>TimeAtLocation</INCLUDE>
        <INCLUDE>ScheduledDepartureDateTime</INCLUDE>
    </QUERY>
</REQUEST>`;

const updateInterval = 5000; // 5 seconds
const maxEventsPerBatch = 10;

let eventSource;

async function fetchSseUrl() {
    try {
        const response = await axios.post('https://api.trafikinfo.trafikverket.se/v2/data.json', requestJson, {
            headers: { 'Content-Type': 'application/xml' }
        });

        const sseUrl = response.data.RESPONSE.RESULT[0].INFO.SSEURL;
        return sseUrl;
    } catch (error) {
        console.error('Error fetching SSE URL:', error.message);
        return null;
    }
}

function startSseStream(sseUrl) {
    eventSource = new EventSource(sseUrl);
    let eventBuffer = [];
    let lastUpdate = new Date();

    eventSource.onmessage = (event) => {
        eventBuffer.push(event.data);

        if (new Date() - lastUpdate >= updateInterval) {
            if (eventBuffer.length > 0) {
                processEvents(eventBuffer.splice(0, maxEventsPerBatch));
                lastUpdate = new Date();
                console.log("Press 'x' to exit")
            }
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error with SSE stream:', error);
        eventSource.close();
        // Optionally implement a reconnection strategy here
    };
}

async function processEvents(events) {
    console.log('New events:');
    for (const event of events) {
        try {
            const responseJson = JSON.parse(event);
            const announcements = responseJson.RESPONSE.RESULT[0].TrainAnnouncement;
            for (const announcement of announcements) {
                console.log('Train ID:', getPropertyString(announcement, 'AdvertisedTrainIdent'));
                console.log('Location:', getPropertyString(announcement, 'LocationSignature'));
                console.log('Activity:', getPropertyString(announcement, 'ActivityType'));
                console.log('Advertised Time:', getPropertyString(announcement, 'AdvertisedTimeAtLocation'));
                console.log('Time at Location:', getPropertyString(announcement, 'TimeAtLocation'));
                console.log('Scheduled Departure:', getPropertyString(announcement, 'ScheduledDepartureDateTime'));
                console.log();
            }
        } catch (error) {
            console.error('Error processing event:', error);
        }
    }
}

function getPropertyString(element, propertyName) {
    return element[propertyName] ? element[propertyName][0] : 'N/A';
}

function setupExitHandler() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (input) => {
        if (input.trim().toUpperCase() === 'X') {
            console.log('Exiting...');
            if (eventSource) {
                eventSource.close();
            }
            process.exit(0);
        }
    });
}

(async function main() {
    const sseUrl = await fetchSseUrl();
    if (sseUrl) {
        startSseStream(sseUrl);
        setupExitHandler();
    }
})();
