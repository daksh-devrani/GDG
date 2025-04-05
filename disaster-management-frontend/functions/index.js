const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Triggered when a new event is created in the Firebase Realtime Database under `/events/{eventId}`.
 * Logs the event data and ID, and demonstrates a conceptual AI/ML trigger
 * and a simple database update.
 */
exports.onNewEvent = functions.database.ref('/events/{eventId}')
    .onCreate(async (snapshot, context) => {
        const eventData = snapshot.val();
        const eventId = context.params.eventId;
        const currentTimeIndia = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'long'
        });

        console.log('New event created:', eventId, eventData, 'at (India Time):', currentTimeIndia);

        // **Conceptual AI/ML Trigger:**
        // In a real application, you would send 'eventData' to your AI/ML service here.
        // The AI/ML service would process the data (e.g., image analysis with OpenCV,
        // advanced severity prediction with TensorFlow) and potentially update
        // the Firebase database with the results.

        // **Example: Updating the event with a creation timestamp (India Time)**
        await admin.database().ref(`/events/${eventId}`).update({
            creationTimestampIndia: currentTimeIndia
        });

        return null;
    });

/**
 * Triggered when the `predicted_severity` field of an event is updated
 * in the Firebase Realtime Database under `/events/{eventId}/predicted_severity`.
 * Logs the new predicted severity and demonstrates a conceptual alert system trigger
 * for high severity events.
 */
exports.onPredictedSeverityUpdated = functions.database.ref('/events/{eventId}/predicted_severity')
    .onUpdate(async (change, context) => {
        const newPredictedSeverity = change.after.val();
        const previousPredictedSeverity = change.before.val();
        const eventId = context.params.eventId;
        const currentTimeIndia = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'long'
        });

        console.log('Predicted severity updated for event:', eventId, 'from:', previousPredictedSeverity, 'to:', newPredictedSeverity, 'at (India Time):', currentTimeIndia);

        // **Conceptual Alert System Trigger:**
        if (newPredictedSeverity > 4) {
            console.log('High severity detected (>', 4, ') for event:', eventId, '. Triggering alert system (conceptual).');
            // In a real system, you might:
            // 1. Send a notification using Firebase Cloud Messaging (FCM) to relevant users/responders.
            // 2. Update a status flag in the database to indicate a high-severity event.
            // 3. Trigger other Cloud Functions to initiate specific response workflows.
        }

        return null;
    });

/**
 * Example of a callable function that could be triggered from the frontend
 * to perform a specific administrative task (replace with your actual logic).
 */
exports.processEventDescription = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated (optional)
    // if (!context.auth) {
    //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
    // }

    const eventId = data.eventId;
    const description = data.description;
    console.log('Processing description for event:', eventId, description);

    if (!eventId || !description) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing eventId or description.');
    }

    const processedDescription = description.toUpperCase(); // Example processing

    await admin.database().ref(`/events/${eventId}`).update({
        processedDescription: processedDescription
    });

    return { processedDescription: processedDescription, eventId: eventId };
});

// You can add more Cloud Functions here to handle other events or tasks,
// such as:
// - Triggering when an event is updated.
// - Running scheduled tasks (using functions.pubsub.schedule).
// - Integrating with other Google Cloud services.