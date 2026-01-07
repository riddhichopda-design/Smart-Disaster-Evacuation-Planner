///Smart Disaster Evacuation Planner

This is Smart Disaster Evacuation Planner which is a web-based system that calculates the safest path between cities based on real
time disaster risk values and distance between them through values recived from hardware. The logic behind this is Dijkstra's 
Algorithm to compute safest + shorteest path and display the map on Ui. We demonstrated this using the Uttarkhand map.


///Features

Real-time disaster risk data from ESP32
Safest path calculation using weighted Dijkstra algorithm
Interactive map with highlighted safe route
Live risk table updates
Serial communication using Web Serial API
Clean UI for selecting start and destination cities
Color-coded risk levels
Simple, lightweight front-end (HTML + JS)


///Project Structure

Smart-Disaster-Planner/
|--- index.html
|--- serial.js
|--- README.md
|--- esp32code.ino


///Technologies Used

HTML, CSS, JavaScript
D3.js (map visualization)
Web Serial API (ESP32 connection)
Dijkstra Algorithm
ESP32 with sensors (water, vibration, flame, DHT11 etc.)


///Installation / Setup

1. Open the project
Just open index.html in your browser
OR run using
npx http-server

2. Connect ESP32
Plug ESP32 into USB
Click Connect Serial on webpage
ESP32 must send JSON formatted data like:
{ "Haridwar": { "flood": 2, "fire": 1, "vibration": 0 } }


/// How It Works

User selects start and destination cities
ESP32 sends live risk values
System updates the risk-weighted graph
Dijkstra algorithm finds the minimum-risk path
Map highlights the safest route with animations


///Hardware Setup

Components:
ESP32 Dev Board
Water Sensor
Vibration Sensor
Flame Sensor
DHT11/DHT22
Jumper Wires
USB Cable
ESP32 should print JSON via Serial:
{"city":"Haridwar","flood":2,"fire":1}

Algorithm Used – Dijkstra

Each city = Node
Each road = Edge
Edge weight = Distance + Disaster Risk
Output = Path with minimum combined cost
Best for safe route calculation because it is fast and reliable.


//Future Improvements

GPS tracking
AI-based disaster prediction
Weather API
Google Maps integration
Database for storing risk history

//Contributors

Riddhi Chopda
Ankita Chavan
Palak Chandak
Bhumika Chaure

Guided By Prof. Rakhi Bharadwaj
