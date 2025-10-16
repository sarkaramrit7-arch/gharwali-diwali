// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD31MZFmZ17DChruqR7dsaU9-OOJCvnoZM",
    authDomain: "seamadic-house-marker.firebaseapp.com",
    databaseURL: "https://seamadic-house-marker-default-rtdb.firebaseio.com",
    projectId: "seamadic-house-marker",
    storageBucket: "seamadic-house-marker.firebasestorage.app",
    messagingSenderId: "46492760717",
    appId: "1:46492760717:web:51e88589e2d1bcd57c80c4",
    measurementId: "G-RW6Y1G2XX9"
};

// Global Constants
const CORRECT_PASSWORD = atob('YW52aQ=='); // "anvi"
const CHALLENGE1_PASSWORD = atob('bWVtb3J5'); // "memory"

const rooms = [
    'backroom', 'family-room', 'kitchen', 'laundry', 'bathroom',
    'office', 'coat-closet', 'stairs', 'dining-room', 'living-room'
];

const roomNames = {
    'backroom': 'Backroom',
    'family-room': 'Family Room',
    'kitchen': 'Kitchen',
    'laundry': 'Laundry',
    'bathroom': 'Bathroom',
    'office': 'Office',
    'coat-closet': 'Coat Closet',
    'stairs': 'Stairs',
    'dining-room': 'Dining Room',
    'living-room': 'Living Room'
};

const teamNames = ['Phuljhari', 'Anaar', 'Charkhi', 'Bullet', 'Rocket', 'Bam'];

const validPlayerNames = [
    'Aayush', 'Aayushi', 'Abhishek', 'Adwait', 'Amrit', 'Anvi', 'Arnab', 'Avirup', 'Biranchi',
    'Deepali', 'Deepika', 'Dipendu', 'Harshal', 'Indira', 'Kevin', 'Maria',
    'Meet', 'Minal', 'Namy', 'Nikunj', 'Prashanth', 'Priyanka', 'Ryan',
    'Sampada', 'Sharan', 'Shaswat', 'Shreeya', 'Sid', 'Sophia', 'Supriya',
    'Swati', 'Tithi', 'Vraja'
];

// Admin players who are not assigned to teams
const adminPlayers = ['Amrit', 'Anvi'];

// Global State Variables
let database = null;
let teamRef = null;
let markedLocations = {};
let currentRoom = null;
let timeRemaining = 120;
let initialTimerValue = 120;
let timerInterval = null;
let gameActive = false;
let teamName = '';
let playerName = '';
let playerId = '';
let bonusAdded = false;
let isConnected = false;
let challengeListenerActive = false;

// Challenge 1 State
let challenge1CurrentGame = null;
let game1Items = [];
let game2AddedItems = [];
let game2RemovedItems = [];

// Practice room state
let practiceState = {};

// Bonus time value
if (!window.bonusTimeValue) {
    window.bonusTimeValue = 30;
}

// Initialize Firebase
async function initializeFirebase() {
    try {
        const app = firebase.initializeApp(firebaseConfig);
        const dbModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        database = dbModule.getDatabase(app);
        
        window.firebaseDB = {
            ref: dbModule.ref,
            set: dbModule.set,
            get: dbModule.get,
            onValue: dbModule.onValue,
            update: dbModule.update,
            remove: dbModule.remove,
            onDisconnect: dbModule.onDisconnect
        };
        
        console.log('✅ Firebase initialized');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return false;
    }
}

