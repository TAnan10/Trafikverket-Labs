const axios = require('axios');
const xml2js = require('xml2js');
const EventSource = require('eventsource');

const authenticationKey = 'd68896103a8141a186a79910d41ce683';  // Replace with your real key
const requestXml = `
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

const updateInterval = 5000;  // 5 seconds
const maxEventsPerBatch = 10;

async function fetchSseUrl() {
    try {
        const response = await axios.post('https://api.trafikinfo.trafikverket.se/v2/data.json', requestXml, {
            headers: { 'Content-Type': 'application/xml' }
        });
        
        // Log the raw response data and the structure
        console.log('Raw response:', response.data);
        let result;
        if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
            result = await xml2js.parseStringPromise(response.data);
        } else {
            result = response.data;
        }

        // Log the parsed result
        console.log('Parsed result:', JSON.stringify(result, null, 2));

        const sseUrl = result.RESPONSE.RESULT[0].INFO.SSEURL;
        return sseUrl;
    } catch (error) {
        console.error('Error fetching SSE URL:', error);
    }
}

function startSseStream(sseUrl) {
    const eventSource = new EventSource(sseUrl);
    let eventBuffer = [];
    let lastUpdate = new Date();

    eventSource.onmessage = async (event) => {
        eventBuffer.push(event.data);

        if (new Date() - lastUpdate >= updateInterval) {
            if (eventBuffer.length > 0) {
                await processEvents(eventBuffer.slice(0, maxEventsPerBatch));
                eventBuffer = eventBuffer.slice(maxEventsPerBatch);
                lastUpdate = new Date();
            }
        }
    };

    eventSource.onerror = (error) => {
        console.error('Error with SSE stream:', error);
        eventSource.close();
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

(async function main() {
    const sseUrl = await fetchSseUrl();
    if (sseUrl) {
        startSseStream(sseUrl);
    }
})();
