from fastapi import FastAPI, HTTPException
from databases import Database
import sqlalchemy
import datetime
import tensorflow as tf
import numpy as np
import firebase_admin
from firebase_admin import credentials, db

DATABASE_URL = "postgresql://disaster_user:daksh@localhost/disaster_management"
MODEL_PATH = "disaster_severity_model.h5"  # Path to your Keras model
FIREBASE_CREDENTIALS_PATH = "firebase_credentials.json"
FIREBASE_DATABASE_URL = "https://dg-98f97-default-rtdb.asia-southeast1.firebasedatabase.app/"  # Replace with your Firebase database URL

database = Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

events = sqlalchemy.Table(
    "events",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("event_type", sqlalchemy.String),
    sqlalchemy.Column("latitude", sqlalchemy.Float),
    sqlalchemy.Column("longitude", sqlalchemy.Float),
    sqlalchemy.Column("description", sqlalchemy.String),
    sqlalchemy.Column("severity", sqlalchemy.Integer),
    sqlalchemy.Column("online", sqlalchemy.Boolean),
    sqlalchemy.Column("timestamp", sqlalchemy.DateTime, default=datetime.datetime.utcnow),
    sqlalchemy.Column("predicted_severity", sqlalchemy.Float, nullable=True),
)

engine = sqlalchemy.create_engine(DATABASE_URL)
metadata.create_all(engine)

app = FastAPI()

# Load the Keras model
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Keras model loaded successfully.")
except Exception as e:
    model = None
    print(f"Error loading Keras model: {e}")

# Firebase Initialization
try:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred, {
        'databaseURL': FIREBASE_DATABASE_URL
    })
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/events/")
async def create_event(event: dict):
    predicted_severity = None
    if model:
        try:
            model_input = np.array([[event["latitude"], event["longitude"], event["severity"]]]) # Adjust input as needed.
            predicted_severity = model.predict(model_input)[0][0] # Adjust output parsing.
            print(f"Predicted severity: {predicted_severity}")
        except Exception as e:
            print(f"Model prediction error: {e}")

    query = events.insert().values(
        event_type=event["event_type"],
        latitude=event["latitude"],
        longitude=event["longitude"],
        description=event["description"],
        severity=event["severity"],
        online=event["online"],
        predicted_severity=predicted_severity,
    )
    last_record_id = await database.execute(query)

    # Send event data to Firebase
    try:
        ref = db.reference('/events')
        ref.push({
            "event_type": event["event_type"],
            "latitude": event["latitude"],
            "longitude": event["longitude"],
            "description": event["description"],
            "severity": event["severity"],
            "online": event["online"],
            "predicted_severity": predicted_severity,
            "timestamp": datetime.datetime.utcnow().isoformat()
        })
        print("Event data sent to Firebase.")
    except Exception as e:
        print(f"Error sending event data to Firebase: {e}")

    return {"id": last_record_id, **event, "predicted_severity": predicted_severity}

@app.get("/events/")
async def read_events():
    postgres_events = []
    firebase_events_list = []
    try:
        query = events.select()
        postgres_events = await database.fetch_all(query)
    except Exception as e:
        print(f"Error reading from PostgreSQL: {e}")

    try:
        ref = db.reference('/events')
        firebase_events = ref.get()
        if firebase_events:
            for key, value in firebase_events.items():
                firebase_events_list.append(value)
    except Exception as e:
        print(f"Error reading from Firebase: {e}")

    return {"postgres_events": postgres_events, "firebase_events": firebase_events_list}

@app.get("/events/{event_id}")
async def read_event(event_id: int):
    postgres_event = None
    try:
        query = events.select().where(events.c.id == event_id)
        postgres_event = await database.fetch_one(query)
    except Exception as e:
        print(f"Error reading from PostgreSQL: {e}")

    firebase_event = None
    try:
        ref = db.reference('/events')
        firebase_events = ref.get()
        if firebase_events:
            for key, value in firebase_events.items():
                if value.get('id') == event_id:  # Assuming you might want to store ID in Firebase as well
                    firebase_event = value
                    break
    except Exception as e:
        print(f"Error reading from Firebase: {e}")

    if postgres_event:
        return {"postgres": postgres_event, "firebase": firebase_event}
    elif firebase_event:
        return {"postgres": None, "firebase": firebase_event}
    else:
        raise HTTPException(status_code=404, detail="Event not found")