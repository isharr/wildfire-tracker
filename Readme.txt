# Wildfire Tracker

A React-based wildfire tracking web app that visualizes recent wildfire events using NASA EONET data. The app helps users explore wildfire activity on an interactive map, filter recent events, open locations in Google Maps, and upload their own CSV data to plot custom points.

---

## Project Story

I started this project in Summer 2025 as a small idea after hearing about how wildfire tracking systems were being used in real-world environmental and emergency response work. During that summer, wildfires were a major issue across many regions, and I became interested in how software could help people understand active wildfire locations through maps, data, and simple visual tools.

At first, the project was a basic wildfire map using NASA’s EONET API. I pushed the first version to GitHub in January 2026. Later, I continued improving it by redesigning the user interface, adding better map interactions, improving the layout, and expanding the functionality. In May 2026, I pushed a more polished version with major UI and feature updates.

This project helped me learn how to work with external APIs, geospatial data, interactive maps, CSV uploads, and real-world data visualization.

---

## Features

- Displays recent wildfire events using NASA EONET data
- Interactive map with wildfire markers
- Event popups showing wildfire details
- Filters for recent wildfire activity, including last 7 days and last 30 days
- Opens selected wildfire locations in Google Maps
- Supports custom CSV upload to plot user-provided location data
- Clean React interface with improved styling and usability
- Designed for future support of more environmental data sources

---

## Tech Stack

- React
- JavaScript
- HTML
- CSS
- NASA EONET API
- Leaflet / React Leaflet
- CSV parsing
- Vercel
- Git / GitHub

---

## How It Works

1. The app requests wildfire event data from NASA’s EONET API.
2. Wildfire events with location data are extracted and processed.
3. Each event is displayed as a marker on an interactive map.
4. Users can filter events by time range.
5. Users can click a marker to view event details.
6. Users can open the wildfire location directly in Google Maps.
7. Users can upload a CSV file with custom location data, and the app plots those points on the map.

---

## CSV Upload

The app supports uploading a CSV file containing custom location data. This allows users to plot their own points on the map in addition to NASA wildfire data.
