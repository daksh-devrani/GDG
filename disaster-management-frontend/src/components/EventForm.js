import React, { useState } from 'react';

const EventForm = ({ onEventSubmit }) => {
  const [eventType, setEventType] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [online, setOnline] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onEventSubmit) {
      const newEvent = {
        event_type: eventType,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: description,
        severity: parseInt(severity),
        online: online,
      };
      onEventSubmit(newEvent);
      // Clear the form after submission
      setEventType('');
      setLatitude('');
      setLongitude('');
      setDescription('');
      setSeverity('');
      setOnline(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="eventType">Event Type:</label>
        <input
          type="text"
          id="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="latitude">Latitude:</label>
        <input
          type="number"
          id="latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="longitude">Longitude:</label>
        <input
          type="number"
          id="longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="severity">Severity (1-5):</label>
        <input
          type="number"
          id="severity"
          min="1"
          max="5"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="online">Online Event:</label>
        <input
          type="checkbox"
          id="online"
          checked={online}
          onChange={(e) => setOnline(e.target.checked)}
        />
      </div>
      <button type="submit">Report Event</button>
    </form>
  );
};

export default EventForm;