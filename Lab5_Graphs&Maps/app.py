import requests
import json
import streamlit as st
import folium
from streamlit_folium import st_folium

APP_TITLE = 'Sweden Train Locations'
APP_SUB_TITLE = 'Source: Trafikverket'


@st.cache_data(ttl=600)  # Cache the function for 10 minutes
def fetch_traffic_data():
    url = "https://api.trafikinfo.trafikverket.se/v2/data.json"
    authentication_key = "d68896103a8141a186a79910d41ce683"

    request_body = f"""
    <REQUEST>
        <LOGIN authenticationkey="{authentication_key}"/>
        <QUERY objecttype="TrainAnnouncement" schemaversion="1.9">
            <FILTER>
                <EQ name="TrainOwner" value="SJ" />
                <EQ name="ScheduledDepartureDateTime" value="2024-06-13T00:00:00.000+02:00" />
                <EQ name="ActivityType" value="Avgang" />
                <EQ name="LocationSignature" value="G" />
            </FILTER>
        </QUERY>
        <QUERY objecttype="TrainPosition" namespace="järnväg.trafikinfo" schemaversion="1.1" limit="300">
            <FILTER>
            </FILTER>
            <INCLUDE>Train.OperationalTrainNumber</INCLUDE>
            <INCLUDE>Position</INCLUDE>
            <INCLUDE>Status</INCLUDE>
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


def parse_point(point_str):
    point_str = point_str.replace('POINT (', '').replace(')', '')
    lon_str, lat_str = point_str.split()
    longitude = float(lon_str)
    latitude = float(lat_str)
    return longitude, latitude


def display_map(TrainAnnouncement):
    m = folium.Map(location=[58, 15], zoom_start=5)

    count = 0
    active = 0

    for train in TrainAnnouncement['RESPONSE']['RESULT'][1]['TrainPosition']:
        if 'Position' in train and 'WGS84' in train['Position']:
            operational_train_number = train['Train']['OperationalTrainNumber']
            point_str = train['Position']['WGS84']
            longitude, latitude = parse_point(point_str)
            count += 1

            if 'Status' in train and train['Status'].get('Active'):
                icon = folium.Icon(color='red')
                active += 1
            else:
                icon = folium.Icon(color='blue')

            folium.Marker(
                location=[latitude, longitude],
                popup=f"Train Number: {operational_train_number}",
                icon=icon
            ).add_to(m)

    st_map = st_folium(m, width=1000, height=800)

    st.subheader('Train Facts')

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric('Number of trains', f"{count}")
    with col2:
        st.metric('Number of trains that are active', f"{active}")
    with col3:
        st.metric('Number of trains going to Stockholm', 30)


def main():
    st.set_page_config(APP_TITLE, layout='wide')
    st.title(APP_TITLE)
    st.caption(APP_SUB_TITLE)

    traffic_data = fetch_traffic_data()

    if traffic_data:
        display_map(traffic_data)
    else:
        st.error("Failed to fetch traffic data.")


if __name__ == "__main__":
    main()
