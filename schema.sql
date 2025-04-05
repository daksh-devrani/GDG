DROP TABLE IF EXISTS events;

CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    description TEXT,
    severity INTEGER,
    online BOOLEAN DEFAULT TRUE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);