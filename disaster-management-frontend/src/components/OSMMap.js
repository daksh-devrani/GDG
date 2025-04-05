import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconRetinaUrl: markerIcon,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const mapCenter = [30.0668, 79.0193];
const defaultZoom = 8;

// Custom hook to handle map clicks
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}

function OSMMap({ onCoordinateSelect }) {
    const [events, setEvents] = useState([]);
    const [selectedEventType, setSelectedEventType] = useState('');

    const handleMapClick = useCallback((latlng) => {
        onCoordinateSelect(latlng); // Pass the coordinates to the parent component (EventForm)
    }, [onCoordinateSelect]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/events/')
            .then(response => {
                const allEvents = [...response.data.postgres_events, ...response.data.firebase_events];
                setEvents(allEvents);
            })
            .catch(error => {
                console.error('Error fetching events for map:', error);
            });
    }, []);

    const filteredEvents = selectedEventType
        ? events.filter(event => event.event_type === selectedEventType)
        : events;

    return (
        <div>
            <h2>Disaster Events on OpenStreetMap</h2>

            <div>
                <label htmlFor="event-type-filter">Filter by Event Type:</label>
                <select
                    id="event-type-filter"
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                >
                    <option value="">All Events</option>
                    <option value="flood">Flood</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="fire">Fire</option>
                    <option value="landslide">Landslide</option>
                    <option value="storm">Storm</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <MapContainer center={mapCenter} zoom={defaultZoom} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredEvents.map((event, index) => (
                    <Marker key={event.id || index} position={[event.latitude, event.longitude]}>
                        <Popup>
                            <strong>{event.event_type}</strong><br />
                            Severity: {event.severity}<br />
                            {event.description && `Description: ${event.description}`}
                        </Popup>
                    </Marker>
                ))}
                <MapClickHandler onMapClick={handleMapClick} />
            </MapContainer>
        </div>
    );
}

export default OSMMap;