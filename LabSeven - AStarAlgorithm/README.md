# Project Title

Shortest Path with A star algorithm with visualization in Javascript

## Description

Understand why A*star search algorithms are used as an alternative to dijkstra's algorithm and use A* to find the shortest route between two stations on the Scania train lines.

First display the map on the web page using the google maps api. Then display the stations by calling the traffic authority's api and creating markers. Be sure to filter the data to only get train station names and coordinates from county 12 which is Scania. Then you will need to connect these stations, half the work is done because in the lab folder there will be a document with an object called connections that has the information about which stations are connecting and the time it takes between stations. You just need to show these connections by creating a function for example and drawing lines using the Google Maps api.

At this point, you see that you have all stations connected to lines in Skåne. Now you can start implementing the A*Star Algorithm. You need a total of 5 functions for the algorithm. They are as follows:
aStarSearch()
reconstructPath()
visualizePath()
showFinalPath()
haversineDistance()

Your task is to show that the algorithm works in real time, which means we can see how the algorithm searches with a specific color as in the picture below. When the search is complete you will be shown the shortest path which is the showFinalPath function and this line will have a different color. In the picture below, the last path is green. You also need to create a button where you can turn the train stations on and off.

## Installation
To be able to run this program on your own device you must have a google maps api key and a Trafikverket api key.

The google maps api key is completely free but you will need to create an account on google maps api. You just use your google account if you wish. 

1. https://developers.google.com/maps/documentation/javascript - Maps JavaScript API(Documentation)

2. https://console.cloud.google.com/apis/library?project=moonlit-aria-427508-b6 - Enable apis

3. https://developers.google.com/maps/documentation/javascript/add-google-map-wc-tut - Add a Google Map with Markers using HTML

Once you have created your account click on the get started button that should be on your screen once you have created your account. If it is not on your screen then click on the first link above. Then click on get started. After that in the header there will be a button called “Create New project”. Click on that and write the name of your project. After that on the left hand side in the menu click on keys and credentials. You will be in a new page then at the top click on create credentials and then create “api key”. Below you will be able to see the key and that will be the key that you will be using for this project.

Then click on the 2nd link. This link brings you to the enable apis website. Here you can add many different apis to your project that google offers. We will be using the “Maps Javascript API” and the “Directions API”. In the search bar search for those apis and click on them and then click enable. You will then be able to use these apis in your project to create maps.

Click on the 3rd link which brings you to the example code and documentation. Here test your api to make sure it works by copy pasting the example code in your code editor and replace the key in the example with your api key.

## Run Project:

When your api key works now you can copy past or clone the github project and just replace my key with your google maps api key and same with the Trafikverket API key. Then open the index.html on google and review the lab.
