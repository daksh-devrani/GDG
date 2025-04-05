import React, { useState } from 'react';
import EventList from './components/EventList';
import Auth from './components/Auth';
import EventForm from './components/EventForm';
import OSMMap from './components/OSMMap';

function App() {
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);

    const handleCoordinateSelect = (coordinates) => {
        setSelectedCoordinates(coordinates);
    };

    return (
        <div className="App">
            <h1>Disaster Management System</h1>
            <Auth />
            <EventForm initialCoordinates={selectedCoordinates} />
            <OSMMap onCoordinateSelect={handleCoordinateSelect} />
            <EventList />
        </div>
    );
}

export default App;