import aiohttp
import asyncio
import json
from datetime import datetime, timedelta

authentication_key = "d68896103a8141a186a79910d41ce683"  # Replace with your real key
request_xml = f"""
<REQUEST>
    <LOGIN authenticationkey="{authentication_key}" />
    <QUERY sseurl="true" objecttype="TrainAnnouncement" orderby="AdvertisedTimeAtLocation" schemaversion="1.3" limit="10">
        <FILTER>
        </FILTER>
        <INCLUDE>LocationSignature</INCLUDE>
        <INCLUDE>AdvertisedTrainIdent</INCLUDE>
        <INCLUDE>ActivityType</INCLUDE>
        <INCLUDE>AdvertisedTimeAtLocation</INCLUDE>
        <INCLUDE>EstimatedTimeAtLocation</INCLUDE>
        <INCLUDE>TimeAtLocation</INCLUDE>
        <INCLUDE>ScheduledDepartureDateTime</INCLUDE>
    </QUERY>
</REQUEST>"""

update_interval = timedelta(seconds=5)
max_events_per_batch = 10

async def fetch_sse_url():
    async with aiohttp.ClientSession() as session:
        headers = {'Content-Type': 'application/xml'}
        async with session.post("https://api.trafikinfo.trafikverket.se/v2/data.json", data=request_xml, headers=headers) as response:
            response.raise_for_status()
            response_json = await response.json()
            sse_url = response_json['RESPONSE']['RESULT'][0]['INFO']['SSEURL']
            return sse_url

async def start_sse_stream(sse_url):
    async with aiohttp.ClientSession() as session:
        async with session.get(sse_url) as response:
            response.raise_for_status()
            event_buffer = []
            last_update = datetime.now()
            try:
                async for line in response.content:
                    if line:
                        line = line.decode('utf-8').strip()
                        if line.startswith("data:"):
                            event_buffer.append(line[5:].strip())
                    
                    if datetime.now() - last_update >= update_interval:
                        if event_buffer:
                            await process_events(event_buffer[:max_events_per_batch])
                            event_buffer = event_buffer[max_events_per_batch:]
                            last_update = datetime.now()
            except asyncio.CancelledError:
                print("Stream was cancelled")
                raise

async def process_events(events):
    print("New events:")
    for event in events:
        try:
            response_json = json.loads(event)
            announcements = response_json['RESPONSE']['RESULT'][0]['TrainAnnouncement']
            for announcement in announcements:
                print("Train ID: " + get_property_string(announcement, "AdvertisedTrainIdent"))
                print("Location: " + get_property_string(announcement, "LocationSignature"))
                print("Activity: " + get_property_string(announcement, "ActivityType"))
                print("Advertised Time: " + get_property_datetime(announcement, "AdvertisedTimeAtLocation"))
                print("Time at Location: " + get_property_datetime(announcement, "TimeAtLocation"))
                print("Scheduled Departure: " + get_property_datetime(announcement, "ScheduledDepartureDateTime"))
                print()
        except Exception as ex:
            print(f"Error processing event: {ex}")

def get_property_string(element, property_name):
    return element.get(property_name, "N/A")

def get_property_datetime(element, property_name):
    return element.get(property_name, "N/A")

async def main():
    sse_url = await fetch_sse_url()
    await start_sse_stream(sse_url)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Program interrupted by user")
