import React, { useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

// Initialize Firebase Auth if not already initialized (you might want to move this to App.js)
if (!firebase.apps.length) {
    const firebaseConfig = {
        apiKey: "YOUR_FIREBASE_API_KEY",
        authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
        databaseURL: "YOUR_FIREBASE_DATABASE_URL",
        projectId: "YOUR_FIREBASE_PROJECT_ID",
        storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
        messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
        appId: "YOUR_FIREBASE_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);
}

function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    const handleSignUp = async () => {
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            setUser(userCredential.user);
            setError('');
            console.log('Sign up successful:', userCredential.user);
        } catch (err) {
            setError(err.message);
            setUser(null);
            console.error('Sign up error:', err);
        }
    };

    const handleSignIn = async () => {
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            setUser(userCredential.user);
            setError('');
            console.log('Sign in successful:', userCredential.user);
        } catch (err) {
            setError(err.message);
            setUser(null);
            console.error('Sign in error:', err);
        }
    };

    const handleSignOut = async () => {
        try {
            await firebase.auth().signOut();
            setUser(null);
            setError('');
            console.log('Sign out successful');
        } catch (err) {
            setError(err.message);
            console.error('Sign out error:', err);
        }
    };

    return (
        <div>
            <h2>Authentication</h2>
            {user ? (
                <div>
                    <p>Logged in as: {user.email}</p>
                    <button onClick={handleSignOut}>Sign Out</button>
                </div>
            ) : (
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleSignUp}>Sign Up</button>
                    <button onClick={handleSignIn}>Sign In</button>
                    {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                </div>
            )}
        </div>
    );
}

export default Auth;