import React, { useState, useCallback } from 'react';
import axios from 'axios';

function EventForm({ initialCoordinates }) {
    const [eventType, setEventType] = useState('');
    const [latitude, setLatitude] = useState(initialCoordinates ? initialCoordinates.lat.toFixed(6) : '');
    const [longitude, setLongitude] = useState(initialCoordinates ? initialCoordinates.lng.toFixed(6) : '');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState(1);
    const [online, setOnline] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccessMessage('');

        const eventData = {
            event_type: eventType,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            description: description,
            severity: parseInt(severity),
            online: online
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/events/', eventData);
            console.log('Event submitted:', response.data);
            setSuccessMessage('Event reported successfully!');
            setEventType('');
            setLatitude('');
            setLongitude('');
            setDescription('');
            setSeverity(1);
            setOnline(true);
        } catch (error) {
            console.error('Error submitting event:', error);
            setError('Failed to report event. Please try again.');
        }
    };

    const handleLatitudeChange = (e) => {
        setLatitude(e.target.value);
    };

    const handleLongitudeChange = (e) => {
        setLongitude(e.target.value);
    };

    return (
        <div>
            <h2>Report New Disaster Event</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="event_type">Event Type:</label>
                    <select id="event_type" value={eventType} onChange={(e) => setEventType(e.target.value)} required>
                        <option value="">Select Type</option>
                        <option value="flood">Flood</option>
                        <option value="earthquake">Earthquake</option>
                        <option value="fire">Fire</option>
                        <option value="landslide">Landslide</option>
                        <option value="storm">Storm</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="latitude">Latitude:</label>
                    <input type="number" id="latitude" value={latitude} onChange={handleLatitudeChange} required readOnly />
                </div>
                <div>
                    <label htmlFor="longitude">Longitude:</label>
                    <input type="number" id="longitude" value={longitude} onChange={handleLongitudeChange} required readOnly />
                </div>
                <div>
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="severity">Severity (1-5):</label>
                    <input type="number" id="severity" min="1" max="5" value={severity} onChange={(e) => setSeverity(parseInt(e.target.value))} required />
                </div>
                <div>
                    <label htmlFor="online">Online:</label>
                    <input type="checkbox" id="online" checked={online} onChange={(e) => setOnline(e.target.checked)} />
                    <span>Is this event report online?</span>
                </div>
                <button type="submit">Report Event</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            </form>
        </div>
    );
}

export default EventForm;