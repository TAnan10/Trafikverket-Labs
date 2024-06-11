import requests
import json
import streamlit as st
import folium
from streamlit_folium import st_folium


def fetch_traffic_data():
    url = "https://api.trafikinfo.trafikverket.se/v2/data.json"
    authentication_key = "d68896103a8141a186a79910d41ce683"

    request_body = f"""
    <REQUEST>
        <LOGIN authenticationkey="{authentication_key}"/>
        <QUERY objecttype="TrainAnnouncement" schemaversion="1.9">
            <FILTER>
                <EQ name="TrainOwner" value="SJ" />
                <EQ name="ScheduledDepartureDateTime" value="2024-06-10T00:00:00.000+02:00" />
                <EQ name="ActivityType" value="Avgang" />
                <EQ name="LocationSignature" value="G" />
            </FILTER>
        </QUERY>
        <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1" limit="1000">
            <FILTER></FILTER>
            <INCLUDE>Train.OperationalTrainNumber</INCLUDE>
            <INCLUDE>Position</INCLUDE>
        </QUERY>
    </REQUEST>
    """

    headers = {
        "Content-Type": "application/xml"
    }

    response = requests.post(url, data=request_body, headers=headers)

    if response.status_code == 200 or response.status_code == 206:
        data = response.json()
        return data
    else:
        print("Error:", response.status_code)
        return None


traffic_data = fetch_traffic_data()
TrainAnnouncement = traffic_data

filename = "map_traffic_data.json"  # Custom filename

# Save the data to the specified JSON file
with open(filename, 'w') as json_file:
    json.dump(TrainAnnouncement, json_file, indent=4)
print(f"Data saved to {filename}")

APP_TITLE = 'Sweden Train Announcements'
APP_SUB_TITLE = 'Source: Trafikverket'


def main():
    st.set_page_config(APP_TITLE, layout='wide')
    st.title(APP_TITLE)
    st.caption(APP_SUB_TITLE)


def parse_point(point_str):
    # Remove the 'POINT (' prefix and the ')' suffix
    point_str = point_str.replace('POINT (', '').replace(')', '')
    # Split the string into longitude and latitude
    lon_str, lat_str = point_str.split()
    # Convert the strings to float
    longitude = float(lon_str)
    latitude = float(lat_str)
    return longitude, latitude


# Example usage
point_str = "POINT (11.976630746836491 57.71011667130036)"
longitude, latitude = parse_point(point_str)

print(f"Longitude: {longitude}, Latitude: {latitude}")


def display_map():
    m = folium.Map(location=[58, 15], zoom_start=5)

    for train in TrainAnnouncement['RESPONSE']['RESULT'][1]['TrainPosition']:
        if 'Position' in train and 'WGS84' in train['Position']:
            operational_train_number = train['Train']['OperationalTrainNumber']
            point_str = train['Position']['WGS84']
            longitude, latitude = parse_point(point_str)
            print(train)

            folium.Marker(
                location=[latitude, longitude],
                popup=f"Train Number: {operational_train_number}"
            ).add_to(m)

    # Display the map
    st_map = st_folium(m, width=1000, height=800)

    # Load Data
    st.subheader('Train Facts')

    col1, col2, col3 = st.columns(3)
    with col1:
        metric_title = 'Number of trains'
        st.metric(metric_title, 10)
    with col2:
        metric_title = 'Number of trains that late'
        st.metric(metric_title, 15)
    with col3:
        metric_title = 'Number of trains going to Stockholm'
        st.metric(metric_title, 30)


if __name__ == "__main__":
    main()
    display_map()
