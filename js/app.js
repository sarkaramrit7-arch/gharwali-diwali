        /*
        ==========================================
        ✅ FIREBASE FULLY CONFIGURED!
        ==========================================
        
        Your Firebase Realtime Database is connected!
        Project: seamadic-house-marker
        Database: https://seamadic-house-marker-default-rtdb.firebaseio.com
        
        🔴 IMPORTANT: SET DATABASE RULES
        
        Go to Firebase Console and set these rules:
        1. Open: https://console.firebase.google.com
        2. Select: seamadic-house-marker project
        3. Click: Realtime Database → Rules tab
        4. Paste this:
        
        {
          "rules": {
            "teams": {
              "$teamId": {
                ".read": true,
                ".write": true
              }
            },
            "scores": {
              ".read": true,
              ".write": true
            },
            "activePlayers": {
              ".read": true,
              ".write": true
            },
            "challengeStatus": {
              ".read": true,
              ".write": true
            },
            "gameSettings": {
              ".read": true,
              ".write": true
            },
            "challenge1": {
              "$teamId": {
                ".read": true,
                ".write": true
              }
            },
            "game2Status": {
              ".read": true,
              ".write": true
            },
            "playerTeamAssignments": {
              ".read": true,
              ".write": true
            }
          }
        }
        
        5. Click "Publish"
        
        ⚠️  Without these rules, the database won't work!
        
        ==========================================
        */

        // YOUR FIREBASE CONFIG
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

        // Obfuscated password - simple encoding
        const _0x4a2b = ['YW52aQ==']; // Base64 encoded "anvi"
        const CORRECT_PASSWORD = atob(_0x4a2b[0]);

        // ==========================================
        // BACKGROUND MUSIC CONTROL
        // ==========================================
        let backgroundMusic = null;
        let isMusicMuted = false;

        // Initialize music when DOM is loaded
        function initMusic() {
            backgroundMusic = document.getElementById('backgroundMusic');
            const musicToggleBtn = document.getElementById('musicToggle');
            
            // Check if user had previously muted music
            const savedMuteState = localStorage.getItem('musicMuted');
            if (savedMuteState === 'true') {
                isMusicMuted = true;
                backgroundMusic.muted = true;
                musicToggleBtn.textContent = '🔇';
                musicToggleBtn.classList.add('muted');
            }
            
            // Try to autoplay music (browsers may block this)
            tryPlayMusic();
            
            // Add click listener to play music on first user interaction
            document.addEventListener('click', function playOnInteraction() {
                if (!backgroundMusic.playing) {
                    tryPlayMusic();
                }
            }, { once: true });
        }

        // Function to toggle music on/off
        function toggleMusic() {
            const musicToggleBtn = document.getElementById('musicToggle');
            
            if (!backgroundMusic) {
                backgroundMusic = document.getElementById('backgroundMusic');
            }
            
            if (isMusicMuted) {
                // Unmute
                backgroundMusic.muted = false;
                isMusicMuted = false;
                musicToggleBtn.textContent = '🔊';
                musicToggleBtn.classList.remove('muted');
                localStorage.setItem('musicMuted', 'false');
                tryPlayMusic();
            } else {
                // Mute
                backgroundMusic.muted = true;
                isMusicMuted = true;
                musicToggleBtn.textContent = '🔇';
                musicToggleBtn.classList.add('muted');
                localStorage.setItem('musicMuted', 'true');
            }
        }

        // Try to play music (handle autoplay restrictions)
        function tryPlayMusic() {
            if (backgroundMusic && !isMusicMuted) {
                backgroundMusic.play().catch(error => {
                    console.log('Autoplay prevented. Music will play after user interaction.');
                });
            }
        }

        // Initialize music when page loads
        document.addEventListener('DOMContentLoaded', initMusic);
        
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
        
        let database = null;
        let teamRef = null;
        let markedLocations = {};
        let currentRoom = null;
        let timeRemaining = 120; // Default 2 minutes (can be changed by admin)
        let initialTimerValue = 120; // Store the admin-set timer value
        let timerInterval = null;
        let gameActive = false;
        let teamName = '';
        let playerName = '';
        let playerId = '';
        let bonusAdded = false;
        let isConnected = false;
        
        // Initialize bonus time value with default
        if (!window.bonusTimeValue) {
            window.bonusTimeValue = 30;
        }
        
        // All valid player names for searchable dropdown
        // Valid player names - loaded from Firebase
        let validPlayerNames = [
            'Aayush', 'Aayushi', 'Abhishek', 'Adwait', 'Arnab', 'Tithi', 'Avirup', 'Biranchi',
            'Deepali', 'Indira', 'Kevin', 'Meet', 'Namy', 'Nikunj', 'Prashanth', 'Priyanka',
            'Ryan', 'Sampada', 'Sharan', 'Shaswat', 'Shreeya', 'Sid', 'Supriya', 'Swati',
            'Vraja', 'Dipendu', 'Sophia', 'Harshal', 'Minal', 'Maria'
        ]; // Default fallback
        
        // Load valid player names from Firebase
        async function loadValidPlayerNames() {
            if (!database || !window.firebaseDB) {
                console.log('⏳ Firebase not ready, using default player list');
                return;
            }
            
            try {
                const { ref, get } = window.firebaseDB;
                const playersRef = ref(database, 'validPlayerNames');
                const snapshot = await get(playersRef);
                
                if (snapshot.exists()) {
                    validPlayerNames = snapshot.val();
                    console.log('✅ Loaded player names from Firebase:', validPlayerNames.length, 'players');
                } else {
                    console.log('ℹ️ No player list in Firebase, using default');
                }
            } catch (error) {
                console.error('❌ Error loading player names:', error);
                console.log('Using default player list');
            }
        }
        
        // Searchable dropdown functionality
        function initializeSearchableDropdown() {
            const input = document.getElementById('playerName');
            const dropdown = document.getElementById('nameDropdown');
            const hiddenInput = document.getElementById('playerNameValidated');
            
            if (!input || !dropdown) return;
            
            // Show all names when input is focused or clicked
            input.addEventListener('focus', function() {
                showFilteredNames('');
            });
            
            input.addEventListener('click', function() {
                showFilteredNames(input.value);
            });
            
            // Filter names as user types
            input.addEventListener('input', function() {
                const searchTerm = input.value;
                hiddenInput.value = ''; // Clear validation until user selects
                showFilteredNames(searchTerm);
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.style.display = 'none';
                }
            });
            
            function showFilteredNames(searchTerm) {
                const filtered = validPlayerNames.filter(name => 
                    name.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                if (filtered.length === 0) {
                    dropdown.innerHTML = '<div style="padding: 12px; color: #ff6b6b; text-align: center;">No matches found</div>';
                    dropdown.style.display = 'block';
                    return;
                }
                
                dropdown.innerHTML = filtered.map(name => `
                    <div class="name-option" 
                         data-name="${name}"
                         style="padding: 12px; cursor: pointer; color: white; border-bottom: 1px solid rgba(255,255,255,0.1); transition: all 0.2s;"
                         onmouseover="this.style.background='rgba(102, 126, 234, 0.5)'"
                         onmouseout="this.style.background='transparent'"
                         onclick="selectPlayerName('${name}')">
                        ${name}
                    </div>
                `).join('');
                
                dropdown.style.display = 'block';
            }
        }
        
        // Select a name from dropdown
        window.selectPlayerName = function(name) {
            const input = document.getElementById('playerName');
            const dropdown = document.getElementById('nameDropdown');
            const hiddenInput = document.getElementById('playerNameValidated');
            
            input.value = name;
            hiddenInput.value = name;
            dropdown.style.display = 'none';
            
            // Clear any previous error
            const nameError = document.getElementById('nameError');
            if (nameError) {
                nameError.classList.remove('show');
            }
        }
        
        // Initialize marked locations structure
        rooms.forEach(room => {
            markedLocations[room] = {};
        });
        
        // Import Firebase modules and initialize
        import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js').then(appModule => {
            return import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js').then(dbModule => {
                return { appModule, dbModule };
            });
        }).then(({ appModule, dbModule }) => {
            const { initializeApp } = appModule;
            const { getDatabase, ref, set, onValue, update, remove, get } = dbModule;
            
            // Initialize Firebase
            try {
                const app = initializeApp(firebaseConfig);
                database = getDatabase(app);
                isConnected = true;
                updateConnectionStatus(true);
                console.log('✅ Firebase initialized successfully');
            } catch (error) {
                console.error('❌ Firebase initialization error:', error);
                updateConnectionStatus(false);
                if (error.code === 'app/invalid-credential') {
                    alert('Firebase configuration error. Please check your databaseURL.');
                }
            }
            
            // Make database functions globally available
            window.firebaseDB = { ref, set, onValue, update, remove, get };
        }).catch(error => {
            console.error('Failed to load Firebase modules:', error);
            updateConnectionStatus(false);
        });

        function updateConnectionStatus(connected) {
            const statusEl = document.getElementById('connectionStatus');
            if (connected) {
                statusEl.className = 'connection-status connected';
                statusEl.textContent = '🟢 Connected to server';
            } else {
                statusEl.className = 'connection-status disconnected';
                statusEl.textContent = '🔴 Disconnected from server';
            }
        }

        function showSyncIndicator(message) {
            const indicator = document.getElementById('syncIndicator');
            indicator.textContent = message;
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 1500);
        }

        // Team names pool for auto-assignment (Diwali firecrackers themed)
        const teamNames = ['Phuljhari', 'Anaar', 'Charkhi', 'Bullet', 'Rocket', 'Bam'];
        const challenges = ['ch1', 'ch2', 'ch3', 'ch4'];
        
        // Load and update leaderboard from Firebase
        function loadLeaderboard() {
            if (!database || !window.firebaseDB) {
                setTimeout(loadLeaderboard, 500);
                return;
            }
            
            const { ref, onValue } = window.firebaseDB;
            const scoresRef = ref(database, 'scores');
            
            onValue(scoresRef, (snapshot) => {
                const scores = snapshot.val() || {};
                updateLeaderboardDisplay(scores);
            });
        }
        
        // Load game settings (timer, bonus time) from Firebase
        function loadGameSettings() {
            if (!database || !window.firebaseDB) {
                setTimeout(loadGameSettings, 500);
                return;
            }
            
            const { ref, onValue } = window.firebaseDB;
            const settingsRef = ref(database, 'gameSettings');
            
            onValue(settingsRef, (snapshot) => {
                const settings = snapshot.val();
                if (settings) {
                    // Update timer values
                    if (settings.initialTimer !== undefined) {
                        initialTimerValue = settings.initialTimer;
                        console.log('⏱️  Timer updated to:', initialTimerValue, 'seconds');
                    }
                    if (settings.bonusTime !== undefined) {
                        window.bonusTimeValue = settings.bonusTime;
                        console.log('⏱️  Bonus time updated to:', settings.bonusTime, 'seconds');
                    }
                } else {
                    // Set defaults if not configured
                    initialTimerValue = 120;
                    window.bonusTimeValue = 30;
                }
            });
        }
        
        // Load and update challenge unlock status from Firebase
        let challengeListenerActive = false;
        
        function loadChallengeStatus() {
            if (!database || !window.firebaseDB) {
                setTimeout(loadChallengeStatus, 500);
                return;
            }
            
            // Only set up listener once
            if (challengeListenerActive) {
                console.log('🔄 Challenge listener already active');
                return;
            }
            
            const { ref, onValue } = window.firebaseDB;
            const challengesRef = ref(database, 'challengeStatus');
            
            console.log('🎯 Setting up real-time challenge status listener...');
            
            onValue(challengesRef, (snapshot) => {
                const status = snapshot.val() || {};
                console.log('🔔 Challenge status update received:', status);
                updateChallengeCards(status);
            });
            
            challengeListenerActive = true;
        }
        
        function updateChallengeCards(status) {
            // Challenge descriptions with full details
            const challengeInfo = {
                1: {
                    title: 'Memory Challenge',
                    shortDesc: 'Test your memory skills!',
                    tooltip: `<strong>📋 Point System</strong>
                        <div class="score-line">🥇 1st Place: 100 points</div>
                        <div class="score-line">🥈 2nd Place: 80 points</div>
                        <div class="score-line">🥉 3rd Place: 60 points</div>
                        <div class="score-line">4th Place: 40 points</div>
                        <div class="score-line">5th Place: 20 points</div>
                        <div class="score-line">6th Place: 0 points</div>`
                },
                2: {
                    title: "Cliche' Party Games",
                    shortDesc: 'Classic party fun!',
                    tooltip: `<strong>🎲 Point System</strong>
                        <div class="score-line"><strong>Game 1:</strong></div>
                        <div class="score-line">🏆 Winner: 30 points</div>
                        <div class="score-line">❌ Loser: 0 points</div>
                        <div class="score-line" style="margin-top: 8px;"><strong>Game 2:</strong></div>
                        <div class="score-line">🏆 Winner: 70 points</div>
                        <div class="score-line">🥈 Runner-up: 35 points</div>
                        <div class="score-line">❌ Loser: 0 points</div>`
                },
                3: {
                    title: "It's Trivia Time",
                    shortDesc: 'Test your knowledge!',
                    tooltip: `<strong>🧠 Point System</strong>
                        <div class="score-line">🥇 1st Place: 150 points</div>
                        <div class="score-line">🥈 2nd Place: 125 points</div>
                        <div class="score-line">🥉 3rd Place: 100 points</div>
                        <div class="score-line">4th Place: 75 points</div>
                        <div class="score-line">5th Place: 50 points</div>
                        <div class="score-line">6th Place: 0 points</div>`
                },
                4: {
                    title: 'House Marker',
                    shortDesc: 'Count items in each room!',
                    tooltip: `<strong>🏠 Point System</strong>
                        <div class="score-line">🥇 1st Place: 150 points</div>
                        <div class="score-line">🥈 2nd Place: 125 points</div>
                        <div class="score-line">🥉 3rd Place: 100 points</div>
                        <div class="score-line">4th Place: 75 points</div>
                        <div class="score-line">5th Place: 50 points</div>
                        <div class="score-line">6th Place: 0 points</div>`
                }
            };
            
            // Update each challenge card based on unlock status
            for (let i = 1; i <= 4; i++) {
                const card = document.getElementById(`challenge${i}`);
                if (!card) continue; // Skip if card doesn't exist yet
                
                const isUnlocked = status[`ch${i}`] === true;
                const info = challengeInfo[i];
                
                if (isUnlocked) {
                    card.classList.add('unlocked');
                    card.innerHTML = `
                        <div class="challenge-tooltip">${info.tooltip}</div>
                        <div class="challenge-card-content">
                            <strong>${info.title}</strong><br>
                            <small style="font-size: 12px; opacity: 0.9;">${info.shortDesc}</small><br>
                            ✨ UNLOCKED<br>
                            <small style="font-size: 10px; opacity: 0.7; margin-top: 5px; display: block;">💡 Hover for details</small>
                        </div>
                    `;
                    console.log(`✅ Challenge ${i} unlocked`);
                    
                    // Add mobile tap support for tooltips
                    card.addEventListener('touchstart', function(e) {
                        // Toggle tooltip on tap for mobile
                        if (window.innerWidth <= 768) {
                            // Remove show-tooltip from all other cards
                            document.querySelectorAll('.challenge-card').forEach(c => {
                                if (c !== card) c.classList.remove('show-tooltip');
                            });
                            card.classList.toggle('show-tooltip');
                            
                            // If Challenge 4, don't prevent navigation
                            if (i !== 4) {
                                e.stopPropagation();
                            }
                        }
                    });
                    
                    // Set up click handlers for playable challenges
                    if (i === 1) {
                        card.onclick = () => selectChallenge1();
                        card.style.cursor = 'pointer';
                    } else if (i === 4) {
                        card.onclick = () => selectChallenge4();
                        card.style.cursor = 'pointer';
                    } else {
                        // Other challenges (2, 3) are not interactive yet
                        card.onclick = null;
                        card.style.cursor = 'default';
                    }
                } else {
                    card.classList.remove('unlocked');
                    card.innerHTML = `Challenge ${i}<br>🔒`;
                    card.onclick = null;
                    console.log(`🔒 Challenge ${i} locked`);
                }
            }
        }
        
        function updateLeaderboardDisplay(scores) {
            const tbody = document.getElementById('leaderboardBody');
            
            // Calculate totals and sort
            const teamsData = teamNames.map(team => {
                const teamScores = scores[team] || {};
                const ch1 = parseInt(teamScores.ch1) || 0;
                const ch2 = parseInt(teamScores.ch2) || 0;
                const ch3 = parseInt(teamScores.ch3) || 0;
                const ch4 = parseInt(teamScores.ch4) || 0;
                const total = ch1 + ch2 + ch3 + ch4;
                
                return {
                    name: team,
                    ch1: ch1,
                    ch2: ch2,
                    ch3: ch3,
                    ch4: ch4,
                    total: total
                };
            });
            
            // Sort by total (descending)
            teamsData.sort((a, b) => b.total - a.total);
            
            // Update table
            tbody.innerHTML = teamsData.map((team, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${team.name}</td>
                    <td>${team.ch1 > 0 ? team.ch1 : '-'}</td>
                    <td>${team.ch2 > 0 ? team.ch2 : '-'}</td>
                    <td>${team.ch3 > 0 ? team.ch3 : '-'}</td>
                    <td>${team.ch4 > 0 ? team.ch4 : '-'}</td>
                    <td>${team.total}</td>
                </tr>
            `).join('');
        }
        
        // Close tooltips when clicking outside (mobile)
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.challenge-card')) {
                document.querySelectorAll('.challenge-card').forEach(c => {
                    c.classList.remove('show-tooltip');
                });
            }
        });
        
        // Check if user has previous session on page load
        window.addEventListener('load', async function() {
            // Load valid player names from Firebase
            await loadValidPlayerNames();
            
            const savedPlayerName = sessionStorage.getItem('playerName');
            const savedTeamName = sessionStorage.getItem('teamName');
            const savedPlayerId = sessionStorage.getItem('playerId');
            
            if (savedPlayerName && savedTeamName && savedPlayerId) {
                // Show confirmation screen instead of auto-filling
                document.getElementById('confirmPlayerName').textContent = savedPlayerName;
                document.getElementById('confirmTeamName').textContent = savedTeamName;
                document.getElementById('confirmScreen').classList.remove('hidden');
                document.getElementById('nameScreen').classList.add('hidden');
            } else {
                // New user - show name screen
                document.getElementById('nameScreen').classList.remove('hidden');
            }
            
            // Load leaderboard from Firebase
            loadLeaderboard();
            
            // Load challenge unlock status from Firebase
            loadChallengeStatus();
            
            // Load game settings (timer) from Firebase
            loadGameSettings();
            
            // Initialize searchable dropdown
            initializeSearchableDropdown();
        });
        
        function confirmIdentity() {
            // User confirmed their identity - go directly to challenges
            const savedPlayerName = sessionStorage.getItem('playerName');
            const savedTeamName = sessionStorage.getItem('teamName');
            const savedPlayerId = sessionStorage.getItem('playerId');
            
            playerName = savedPlayerName;
            teamName = savedTeamName;
            playerId = savedPlayerId;
            
            // Go to challenges screen
            document.getElementById('confirmScreen').classList.add('hidden');
            document.getElementById('challengesScreen').classList.remove('hidden');
            
            // Load challenge status when entering challenges screen
            loadChallengeStatus();
        }
        
        function startFresh() {
            // User wants to start fresh - clear storage and show name screen
            sessionStorage.clear();
            document.getElementById('confirmScreen').classList.add('hidden');
            document.getElementById('nameScreen').classList.remove('hidden');
        }
        
        async function loadTeamMembers() {
            // Load and display all current team members
            const teamMembersList = document.getElementById('teamMembersList');
            
            // Wait for Firebase to be ready
            let retries = 0;
            while ((!database || !window.firebaseDB) && retries < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }
            
            if (!database || !window.firebaseDB) {
                teamMembersList.innerHTML = '<p style="color: #999; text-align: center; font-size: 14px;">You are the first member! 🎉</p>';
                return;
            }
            
            try {
                const { ref, get } = window.firebaseDB;
                const activePlayersRef = ref(database, 'activePlayers');
                const snapshot = await get(activePlayersRef);
                const members = [];
                
                if (snapshot.exists()) {
                    const activePlayers = snapshot.val();
                    // Get all players from the same team
                    for (let pid in activePlayers) {
                        if (activePlayers[pid].team === teamName && activePlayers[pid].isActive) {
                            members.push(activePlayers[pid].name);
                        }
                    }
                }
                
                // Display team members
                if (members.length === 0) {
                    teamMembersList.innerHTML = '<p style="color: #999; text-align: center; font-size: 14px;">You are the first member! 🎉</p>';
                } else {
                    const membersHTML = members.map(name => 
                        `<div style="display: inline-block; padding: 8px 15px; margin: 5px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-size: 14px; font-weight: 500;">
                            ${name === playerName ? '👤 ' + name + ' (You)' : '👥 ' + name}
                        </div>`
                    ).join('');
                    teamMembersList.innerHTML = `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 5px;">${membersHTML}</div>`;
                }
            } catch (error) {
                console.error('Error loading team members:', error);
                // Show as first member instead of error
                teamMembersList.innerHTML = '<p style="color: #999; text-align: center; font-size: 14px;">You are the first member! 🎉</p>';
            }
        }
        
        async function proceedToPassword() {
            const enteredPlayerName = document.getElementById('playerName').value.trim();
            const validatedName = document.getElementById('playerNameValidated').value;
            const nameError = document.getElementById('nameError');
            const continueBtn = document.querySelector('#nameScreen .login-btn');
            
            if (!enteredPlayerName) {
                nameError.textContent = 'Please select your name from the list!';
                nameError.classList.add('show');
                return;
            }
            
            // Validate that the name is from the approved list
            if (!validatedName || !validPlayerNames.includes(validatedName)) {
                nameError.textContent = 'Please select a valid name from the dropdown list!';
                nameError.classList.add('show');
                return;
            }
            
            // Show loading state
            const originalBtnText = continueBtn.textContent;
            continueBtn.disabled = true;
            continueBtn.textContent = 'Checking availability...';
            nameError.classList.remove('show');
            playerName = validatedName;
            
            // Check if this player name is already in use
            const isAvailable = await checkPlayerNameAvailability(playerName);
            
            // Reset button state
            continueBtn.disabled = false;
            continueBtn.textContent = originalBtnText;
            
            if (!isAvailable) {
                nameError.textContent = `"${playerName}" is already logged in! Please choose a different name.`;
                nameError.classList.add('show');
                document.getElementById('playerName').value = '';
                return;
            }
            
            // Check for manual team assignment from admin
            continueBtn.textContent = 'Checking team assignment...';
            continueBtn.disabled = true;
            
            try {
                const { ref, get } = window.firebaseDB;
                const assignmentRef = ref(database, `playerTeamAssignments/${playerName}`);
                const assignmentSnapshot = await get(assignmentRef);
                const manualAssignment = assignmentSnapshot.val();
                
                if (manualAssignment && teamNames.includes(manualAssignment)) {
                    // Use manual assignment from admin
                    teamName = manualAssignment;
                    console.log(`✅ Using manual team assignment: ${teamName}`);
                } else {
                    // Fallback to consistent hashing if no manual assignment
                    const hash = playerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const teamIndex = hash % teamNames.length;
                    teamName = teamNames[teamIndex];
                    console.log(`ℹ️ No manual assignment, using consistent hashing: ${teamName}`);
                }
            } catch (error) {
                console.error('Error checking team assignment:', error);
                // Fallback to consistent hashing on error
                const hash = playerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const teamIndex = hash % teamNames.length;
                teamName = teamNames[teamIndex];
            }
            
            continueBtn.disabled = false;
            continueBtn.textContent = originalBtnText;
            
            // Generate player ID immediately
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Store in sessionStorage
            sessionStorage.setItem('playerName', playerName);
            sessionStorage.setItem('teamName', teamName);
            sessionStorage.setItem('playerId', playerId);
            
            // Register player as active in Firebase immediately
            // Wait a moment for Firebase to be fully ready
            setTimeout(() => {
                if (database && window.firebaseDB) {
                    const { ref, set } = window.firebaseDB;
                    const playerActiveRef = ref(database, `activePlayers/${playerId}`);
                    set(playerActiveRef, {
                        name: playerName,
                        team: teamName,
                        isActive: true,
                        loginTime: Date.now()
                    }).then(() => {
                        console.log('✅ Player registered in Firebase:', playerName, 'Team:', teamName, 'ID:', playerId);
                    }).catch(error => {
                        console.error('❌ Error registering player:', error);
                    });
                } else {
                    console.warn('⚠️ Firebase not ready, player not registered');
                }
            }, 200);

            
            // Show on team assignment screen
            document.getElementById('displayNameLabel2').textContent = playerName;
            document.getElementById('displayTeamLabel2').textContent = teamName;
            
            // Load and display team members
            await loadTeamMembers();
            
            // Switch screens
            document.getElementById('nameScreen').classList.add('hidden');
            document.getElementById('teamScreen').classList.remove('hidden');
        }
        
        function proceedToChallenges() {
            // Switch from team screen to challenges screen
            document.getElementById('teamScreen').classList.add('hidden');
            document.getElementById('challengesScreen').classList.remove('hidden');
            
            // Reload challenge status when entering challenges screen
            loadChallengeStatus();
        }
        
        function backToNameFromTeam() {
            // Go back from team screen to name screen
            document.getElementById('teamScreen').classList.add('hidden');
            document.getElementById('nameScreen').classList.remove('hidden');
        }
        
        function leaveTeamFromAssignment() {
            // User wants to leave team from assignment screen
            if (confirm('Are you sure you want to leave? This will clear your session.')) {
                // Remove from active players if already registered
                if (database && window.firebaseDB && playerId) {
                    const { ref, remove } = window.firebaseDB;
                    const playerActiveRef = ref(database, `activePlayers/${playerId}`);
                    remove(playerActiveRef);
                }
                // Clear sessionStorage
                sessionStorage.clear();
                // Reload page to start fresh
                location.reload();
            }
        }
        
        async function backToTeamFromChallenges() {
            // Go back from challenges screen to team screen
            document.getElementById('challengesScreen').classList.add('hidden');
            
            // Update team info display
            document.getElementById('displayNameLabel2').textContent = playerName;
            document.getElementById('displayTeamLabel2').textContent = teamName;
            
            // Reload team members
            await loadTeamMembers();
            
            document.getElementById('teamScreen').classList.remove('hidden');
        }
        
        function selectChallenge4() {
            // User clicked on Challenge 4 - go to password screen
            document.getElementById('challengesScreen').classList.add('hidden');
            document.getElementById('passwordScreen').classList.remove('hidden');
        }
        
        function backToChallengesFromPassword() {
            // Go back from password screen to challenges screen
            document.getElementById('passwordScreen').classList.add('hidden');
            document.getElementById('password').value = '';
            document.getElementById('passwordError').classList.remove('show');
            document.getElementById('challengesScreen').classList.remove('hidden');
        }
        
        // ==================== CHALLENGE 1 FUNCTIONS ====================
        
        // Challenge 1 Password (encoded)
        const CHALLENGE1_PASSWORD = atob('bWVtb3J5'); // "memory"
        
        // Challenge 1 State
        let challenge1CurrentGame = null; // 'game1' or 'game2'
        let game1Items = [];
        let game2AddedItems = [];
        let game2RemovedItems = [];
        let game2Unlocked = false; // Game 2 lock status
        
        // Game 1 Timer
        let game1TimeRemaining = 75; // 75 seconds default
        let game1TimerInterval = null;
        let game1TimerActive = false;
        let game1InitialTimer = 75; // Will be loaded from Firebase
        
        // Game 2 Timer
        let game2TimeRemaining = 60; // 60 seconds default
        let game2TimerInterval = null;
        let game2TimerActive = false;
        let game2InitialTimer = 60; // Will be loaded from Firebase
        
        window.selectChallenge1 = function() {
            document.getElementById('challengesScreen').classList.add('hidden');
            document.getElementById('challenge1PasswordScreen').classList.remove('hidden');
        }
        
        window.startChallenge1 = function() {
            const password = document.getElementById('challenge1Password').value;
            const errorEl = document.getElementById('challenge1PasswordError');
            
            if (password === CHALLENGE1_PASSWORD) {
                errorEl.classList.remove('show');
                document.getElementById('challenge1PasswordScreen').classList.add('hidden');
                document.getElementById('challenge1SelectionScreen').classList.remove('hidden');
                document.getElementById('ch1SelectionTeamName').textContent = teamName;
                document.getElementById('challenge1Password').value = '';
                
                // Check Game 2 lock status from Firebase
                checkGame2LockStatus();
            } else {
                errorEl.classList.add('show');
            }
        }
        
        // Check if Game 2 is unlocked by admin
        function checkGame2LockStatus() {
            if (!database || !window.firebaseDB) return;
            
            const { ref, onValue } = window.firebaseDB;
            const game2StatusRef = ref(database, 'game2Status/unlocked');
            
            onValue(game2StatusRef, (snapshot) => {
                game2Unlocked = snapshot.val() === true;
                updateGame2Button();
            });
        }
        
        function updateGame2Button() {
            const game2Card = document.querySelector('[onclick="selectGame2()"]');
            if (!game2Card) return;
            
            // Find the description and lock text by ID
            const descriptionText = document.getElementById('game2Description');
            const lockText = document.getElementById('game2LockText');
            
            if (game2Unlocked) {
                // Show description, hide lock text
                game2Card.style.opacity = '1';
                game2Card.style.cursor = 'pointer';
                game2Card.style.pointerEvents = 'auto';
                if (descriptionText) descriptionText.style.display = 'block';
                if (lockText) lockText.style.display = 'none';
            } else {
                // Hide description, show lock text
                game2Card.style.opacity = '0.5';
                game2Card.style.cursor = 'not-allowed';
                game2Card.style.pointerEvents = 'none';
                if (descriptionText) descriptionText.style.display = 'none';
                if (lockText) lockText.style.display = 'block';
            }
        }
        
        window.backToChallengesFromChallenge1Password = function() {
            document.getElementById('challenge1PasswordScreen').classList.add('hidden');
            document.getElementById('challenge1Password').value = '';
            document.getElementById('challenge1PasswordError').classList.remove('show');
            document.getElementById('challengesScreen').classList.remove('hidden');
        }
        
        window.backToChallengesFromGame1Selection = function() {
            document.getElementById('challenge1SelectionScreen').classList.add('hidden');
            document.getElementById('challengesScreen').classList.remove('hidden');
        }
        
        window.selectGame1 = function() {
            // Check if game is already completed
            checkGameCompletionStatus('game1').then(isCompleted => {
                if (isCompleted) {
                    showSubmissionModal('game1');
                    return;
                }
                
                challenge1CurrentGame = 'game1';
                document.getElementById('challenge1SelectionScreen').classList.add('hidden');
                
                const game1Screen = document.getElementById('game1Screen');
                game1Screen.classList.remove('hidden');
                game1Screen.classList.add('active');
                
                // Initialize Game 1
                document.getElementById('game1TeamName').textContent = teamName;
                document.getElementById('game1PlayerName').textContent = `Player: ${playerName}`;
                
                // Load timer settings and start game
                loadGame1Settings().then(() => {
                    initializeGame1();
                    checkAndStartGame1Timer();
                });
            });
        }
        
        // Check if a game is already completed
        async function checkGameCompletionStatus(gameName) {
            if (!database || !window.firebaseDB) return false;
            
            const teamId = teamName.toLowerCase();
            const { ref, get } = window.firebaseDB;
            const gameStateRef = ref(database, `challenge1/${teamId}/${gameName}State`);
            
            try {
                const snapshot = await get(gameStateRef);
                if (snapshot.exists()) {
                    const state = snapshot.val();
                    return state.completed === true;
                }
                return false;
            } catch (error) {
                console.error(`❌ Error checking ${gameName} completion:`, error);
                return false;
            }
        }
        
        // Load Game 1 timer settings from Firebase
        async function loadGame1Settings() {
            if (!database || !window.firebaseDB) {
                console.log('⏳ Waiting for Firebase...');
                await new Promise(resolve => setTimeout(resolve, 500));
                return loadGame1Settings();
            }
            
            try {
                const { ref, get, set } = window.firebaseDB;
                const settingsRef = ref(database, 'gameSettings/game1InitialTimer');
                const snapshot = await get(settingsRef);
                if (snapshot.exists()) {
                    game1InitialTimer = snapshot.val();
                    console.log('✅ Game 1 timer loaded from Firebase:', game1InitialTimer);
                } else {
                    // Set default if not exists
                    game1InitialTimer = 75;
                    await set(settingsRef, 75);
                    console.log('📝 Set default Game 1 timer:', 75);
                }
            } catch (error) {
                console.error('❌ Error loading Game 1 settings:', error);
                game1InitialTimer = 75; // fallback
            }
        }
        
        // Check and start/join Game 1 timer
        async function checkAndStartGame1Timer() {
            if (!database || !window.firebaseDB) {
                console.log('⏳ Waiting for Firebase...');
                await new Promise(resolve => setTimeout(resolve, 500));
                return checkAndStartGame1Timer();
            }
            
            const teamId = teamName.toLowerCase();
            const { ref, get } = window.firebaseDB;
            const gameStateRef = ref(database, `challenge1/${teamId}/game1State`);
            
            try {
                const snapshot = await get(gameStateRef);
                
                if (snapshot.exists()) {
                    const state = snapshot.val();
                    if (state.gameActive) {
                        // Game is already running, sync to current time
                        console.log('⏱️ Joining active Game 1...');
                        syncGame1Timer();
                    } else {
                        // Game hasn't started, start it
                        console.log('🚀 Starting new Game 1...');
                        startGame1Timer();
                    }
                } else {
                    // No game state, start fresh
                    console.log('🆕 Creating new Game 1 session...');
                    startGame1Timer();
                }
            } catch (error) {
                console.error('❌ Error checking game state:', error);
                startGame1Timer(); // fallback to starting
            }
        }
        
        // Start Game 1 timer
        async function startGame1Timer() {
            if (!database || !window.firebaseDB) return;
            
            const teamId = teamName.toLowerCase();
            const { ref, set } = window.firebaseDB;
            const gameStateRef = ref(database, `challenge1/${teamId}/game1State`);
            
            const startTime = Date.now();
            
            await set(gameStateRef, {
                gameActive: true,
                startTime: startTime,
                initialTime: game1InitialTimer,
                endTime: startTime + (game1InitialTimer * 1000)
            });
            
            console.log('✅ Game 1 timer started');
            syncGame1Timer();
        }
        
        // Sync Game 1 timer across all players
        function syncGame1Timer() {
            if (!database || !window.firebaseDB) return;
            
            const teamId = teamName.toLowerCase();
            const { ref, onValue } = window.firebaseDB;
            const gameStateRef = ref(database, `challenge1/${teamId}/game1State`);
            
            // Listen for timer updates
            onValue(gameStateRef, (snapshot) => {
                if (snapshot.exists()) {
                    const state = snapshot.val();
                    
                    if (state.gameActive) {
                        const now = Date.now();
                        const timeElapsed = Math.floor((now - state.startTime) / 1000);
                        game1TimeRemaining = Math.max(0, state.initialTime - timeElapsed);
                        
                        updateGame1TimerDisplay();
                        
                        if (game1TimeRemaining <= 0 && !game1TimerActive) {
                            endGame1();
                        }
                        
                        // Start local interval if not already running
                        if (!game1TimerInterval) {
                            game1TimerInterval = setInterval(() => {
                                const now = Date.now();
                                const timeElapsed = Math.floor((now - state.startTime) / 1000);
                                game1TimeRemaining = Math.max(0, state.initialTime - timeElapsed);
                                updateGame1TimerDisplay();
                                
                                if (game1TimeRemaining <= 0) {
                                    clearInterval(game1TimerInterval);
                                    game1TimerInterval = null;
                                    endGame1();
                                }
                            }, 1000);
                        }
                    }
                }
            });
        }
        
        // Update Game 1 timer display
        function updateGame1TimerDisplay() {
            const timerElement = document.getElementById('game1Timer');
            if (!timerElement) return;
            
            const minutes = Math.floor(game1TimeRemaining / 60);
            const seconds = game1TimeRemaining % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Color change when time is running low
            if (game1TimeRemaining <= 10) {
                timerElement.style.color = '#dc3545';
            } else if (game1TimeRemaining <= 30) {
                timerElement.style.color = '#ffc107';
            } else {
                timerElement.style.color = '#667eea';
            }
        }
        
        // End Game 1
        async function endGame1() {
            if (game1TimerActive) return; // Prevent multiple calls
            game1TimerActive = true;
            
            if (!database || !window.firebaseDB) return;
            
            const teamId = teamName.toLowerCase();
            const { ref, update } = window.firebaseDB;
            const gameStateRef = ref(database, `challenge1/${teamId}/game1State`);
            
            await update(gameStateRef, {
                gameActive: false,
                completed: true
            });
            
            alert('⏰ Time\'s up! Game 1 has ended.');
            
            // Disable inputs
            const input = document.getElementById('game1Input');
            const addBtn = document.querySelector('#game1Screen button[onclick*="addGame1Item"]');
            if (input) input.disabled = true;
            if (addBtn) addBtn.disabled = true;
        }
        
        window.selectGame2 = function() {
            if (!game2Unlocked) {
                alert('Game 2 is locked! Please wait for admin to unlock it.');
                return;
            }
            
            // Check if game is already completed
            checkGameCompletionStatus('game2').then(isCompleted => {
                if (isCompleted) {
                    showSubmissionModal('game2');
                    return;
                }
                
                challenge1CurrentGame = 'game2';
                document.getElementById('challenge1SelectionScreen').classList.add('hidden');
                
                const game2Screen = document.getElementById('game2Screen');
                game2Screen.classList.remove('hidden');
                game2Screen.classList.add('active');
                
                // Initialize Game 2
                document.getElementById('game2TeamName').textContent = teamName;
                document.getElementById('game2PlayerName').textContent = `Player: ${playerName}`;
                
                // Load timer settings and start game
                loadGame2Settings().then(() => {
                    initializeGame2();
                    checkAndStartGame2Timer();
                });
            });
        }
        
        // Load Game 2 timer settings from Firebase
        async function loadGame2Settings() {
            if (!database || !window.firebaseDB) {
                console.log('⏳ Waiting for Firebase...');
                await new Promise(resolve => setTimeout(resolve, 500));
                return loadGame2Settings();
            }
            
            try {
                const { ref, get, set } = window.firebaseDB;
                const settingsRef = ref(database, 'gameSettings/game2InitialTimer');
                const snapshot = await get(settingsRef);
                if (snapshot.exists()) {
                    game2InitialTimer = snapshot.val();
                    console.log('✅ Game 2 timer loaded from Firebase:', game2InitialTimer);
                } else {
                    // Set default if not exists
                    game2InitialTimer = 60;
                    await set(settingsRef, 60);
                    console.log('📝 Set default Game 2 timer:', 60);
                }
            } catch (error) {
                console.error('❌ Error loading Game 2 settings:', error);
                game2InitialTimer = 60; // fallback
            }
        }
        
        // Check and start/join Game 2 timer
        async function checkAndStartGame2Timer() {
            if (!database || !window.firebaseDB) {
                console.log('⏳ Waiting for Firebase...');
                await new Promise(resolve => setTimeout(resolve, 500));
                return checkAndStartGame2Timer();
            }
            
            const teamId = teamName.toLowerCase();
            const { ref, get } = window.firebaseDB;
            const gameStateRef = ref(database, `challenge1/${teamId}/game2State`);
            
            try {
                const snapshot = await get(gameStateRef);
                
                if (snapshot.exists()) {
                    const state = snapshot.val();
                    if (state.gameActive) {
                        // Game is already running, sync to current time
                        console.log('⏱️ Joining active Game 2...');
                        syncGame2Timer();
                    } else {
                        // Game hasn't started, start it
                        console.log('🚀 Starting new Game 2...');
                        startGame2Timer();
                    }
                } else {
                    // No game state, start fresh
                    console.log('🆕 Creating new Game 2 session...');
                    startGame2Timer();
                }
            } catch (error) {
                console.error('❌ Error checking Game 2 state:', error);
                startGame2Timer(); // fallback to starting
            }
        }
        
        // Start Game 2 timer
        async function startGame2Timer() {
            if (!database || !window.firebaseDB) return;
            
            const teamId = teamName.toLowerCase();
            const { ref, set } = window.firebaseDB;
            const gameStateRef = ref(database, `challenge1/${teamId}/game2State`);
            
            const startTime = Date.now();
            
            await set(gameStateRef, {
                gameActive: true,
                startTime: startTime,
                initialTime: game2InitialTimer,
                endTime: startTime + (game2InitialTimer * 1000)
            });
            
            console.log('✅ Game 2 timer started');
            syncGame2Timer();
        }
        
        // Sync Game 2 timer across all players
        function syncGame2Timer() {
            if (!database || !window.firebaseDB) return;
            
            const teamId = teamName.toLowerCase();
            const { ref, onValue } = window.firebaseDB;
            const gameStateRef = ref(database, `challenge1/${teamId}/game2State`);
            
            // Listen for timer updates
            onValue(gameStateRef, (snapshot) => {
                if (snapshot.exists()) {
                    const state = snapshot.val();
                    
                    if (state.gameActive) {
                        const now = Date.now();
                        const timeElapsed = Math.floor((now - state.startTime) / 1000);
                        game2TimeRemaining = Math.max(0, state.initialTime - timeElapsed);
                        
                        updateGame2TimerDisplay();
                        
                        if (game2TimeRemaining <= 0 && !game2TimerActive) {
                            endGame2();
                        }
                        
                        // Start local interval if not already running
                        if (!game2TimerInterval) {
                            game2TimerInterval = setInterval(() => {
                                const now = Date.now();
                                const timeElapsed = Math.floor((now - state.startTime) / 1000);
                                game2TimeRemaining = Math.max(0, state.initialTime - timeElapsed);
                                updateGame2TimerDisplay();
                                
                                if (game2TimeRemaining <= 0) {
                                    clearInterval(game2TimerInterval);
                                    game2TimerInterval = null;
                                    endGame2();
                                }
                            }, 1000);
                        }
                    }
                }
            });
        }
        
        // Update Game 2 timer display
        function updateGame2TimerDisplay() {
            const timerElement = document.getElementById('game2Timer');
            if (!timerElement) return;
            
            const minutes = Math.floor(game2TimeRemaining / 60);
            const seconds = game2TimeRemaining % 60;
            timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Color change when time is running low
            if (game2TimeRemaining <= 10) {
                timerElement.style.color = '#dc3545';
            } else if (game2TimeRemaining <= 30) {
                timerElement.style.color = '#ffc107';
            } else {
                timerElement.style.color = '#f093fb';
            }
        }
        
        // End Game 2
        async function endGame2() {
            if (game2TimerActive) return; // Prevent multiple calls
            game2TimerActive = true;
            
            if (!database || !window.firebaseDB) return;
            
            const teamId = teamName.toLowerCase();
            const { ref, update } = window.firebaseDB;
            const gameStateRef = ref(database, `challenge1/${teamId}/game2State`);
            
            await update(gameStateRef, {
                gameActive: false,
                completed: true
            });
            
            alert('⏰ Time\'s up! Game 2 has ended.');
            
            // Disable inputs
            const addedInput = document.getElementById('game2AddedInput');
            const removedInput = document.getElementById('game2RemovedInput');
            const addedBtn = document.querySelector('#game2Screen button[onclick*="addGame2Added"]');
            const removedBtn = document.querySelector('#game2Screen button[onclick*="addGame2Removed"]');
            if (addedInput) addedInput.disabled = true;
            if (removedInput) removedInput.disabled = true;
            if (addedBtn) addedBtn.disabled = true;
            if (removedBtn) removedBtn.disabled = true;
        }
        
        window.backToGame1Selection = function() {
            // Clear timer interval
            if (game1TimerInterval) {
                clearInterval(game1TimerInterval);
                game1TimerInterval = null;
            }
            
            const game1Screen = document.getElementById('game1Screen');
            game1Screen.classList.add('hidden');
            game1Screen.classList.remove('active');
            document.getElementById('challenge1SelectionScreen').classList.remove('hidden');
        }
        
        window.backToGame2Selection = function() {
            // Clear timer interval
            if (game2TimerInterval) {
                clearInterval(game2TimerInterval);
                game2TimerInterval = null;
            }
            
            const game2Screen = document.getElementById('game2Screen');
            game2Screen.classList.add('hidden');
            game2Screen.classList.remove('active');
            document.getElementById('challenge1SelectionScreen').classList.remove('hidden');
        }
        
        // Game 1: Add/Remove Items
        function initializeGame1() {
            console.log('Initializing Game 1...');
            
            // Don't reset items immediately - wait for Firebase to load
            // game1Items = [];
            
            // Try updating display after a short delay to ensure DOM is ready
            setTimeout(() => {
                updateGame1Display();
                console.log('Game 1 display updated, items:', game1Items.length);
            }, 100);
            
            // Set up Firebase listener for real-time sync
            if (database && window.firebaseDB) {
                const { ref, onValue } = window.firebaseDB;
                const teamId = teamName.toLowerCase();
                const game1Ref = ref(database, `challenge1/${teamId}/game1`);
                
                console.log('Setting up Firebase listener for Game 1');
                
                onValue(game1Ref, (snapshot) => {
                    const data = snapshot.val();
                    console.log('Game 1 Firebase data received:', data);
                    
                    if (data && data.items) {
                        game1Items = data.items;
                    } else {
                        game1Items = [];
                    }
                    updateGame1Display();
                });
            } else {
                console.error('Database not ready for Game 1');
                game1Items = [];
                updateGame1Display();
            }
        }
        
        window.addGame1Item = function() {
            const input = document.getElementById('game1Input');
            const text = input.value.trim();
            
            if (!text) return;
            if (game1Items.length >= 25) {
                alert('Maximum 25 items reached!');
                return;
            }
            
            game1Items.push({
                text: text,
                id: Date.now(),
                playerName: playerName
            });
            
            input.value = '';
            updateGame1Display();
            syncGame1ToFirebase();
        }
        
        window.removeGame1Item = function(id) {
            game1Items = game1Items.filter(item => item.id !== id);
            updateGame1Display();
            syncGame1ToFirebase();
        }
        
        function updateGame1Display() {
            const container = document.getElementById('game1Items');
            const countEl = document.getElementById('game1Count');
            
            if (!container || !countEl) {
                console.error('Game1 elements not found:', { container, countEl });
                return;
            }
            
            countEl.textContent = game1Items.length;
            
            if (game1Items.length === 0) {
                container.innerHTML = '<p style="color: #999; margin: auto;">No items yet. Start typing!</p>';
                return;
            }
            
            container.innerHTML = game1Items.map(item => `
                <div class="item-tag">
                    <span>${item.text}</span>
                    <button class="remove-btn" onclick="window.removeGame1Item(${item.id})">✕</button>
                </div>
            `).join('');
        }
        
        function syncGame1ToFirebase() {
            if (!database || !window.firebaseDB) return;
            
            const { ref, set } = window.firebaseDB;
            const teamId = teamName.toLowerCase();
            const game1Ref = ref(database, `challenge1/${teamId}/game1`);
            
            set(game1Ref, {
                items: game1Items,
                count: game1Items.length,
                lastUpdated: Date.now()
            }).catch(err => console.error('Sync error:', err));
        }
        
        // Game 2: Added/Removed Items
        function initializeGame2() {
            game2AddedItems = [];
            game2RemovedItems = [];
            updateGame2Display();
            
            // Set up Firebase listener for real-time sync
            if (database && window.firebaseDB) {
                const { ref, onValue } = window.firebaseDB;
                const teamId = teamName.toLowerCase();
                const game2Ref = ref(database, `challenge1/${teamId}/game2`);
                
                onValue(game2Ref, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        if (data.added) game2AddedItems = data.added;
                        if (data.removed) game2RemovedItems = data.removed;
                        updateGame2Display();
                    }
                });
            }
        }
        
        window.addGame2Added = function() {
            const input = document.getElementById('game2AddedInput');
            const text = input.value.trim();
            
            if (!text) return;
            if (game2AddedItems.length >= 5) {
                alert('Maximum 5 items in Added section!');
                return;
            }
            
            game2AddedItems.push({
                text: text,
                id: Date.now(),
                playerName: playerName
            });
            
            input.value = '';
            updateGame2Display();
            syncGame2ToFirebase();
        }
        
        window.addGame2Removed = function() {
            const input = document.getElementById('game2RemovedInput');
            const text = input.value.trim();
            
            if (!text) return;
            if (game2RemovedItems.length >= 5) {
                alert('Maximum 5 items in Removed section!');
                return;
            }
            
            game2RemovedItems.push({
                text: text,
                id: Date.now(),
                playerName: playerName
            });
            
            input.value = '';
            updateGame2Display();
            syncGame2ToFirebase();
        }
        
        window.removeGame2Added = function(id) {
            game2AddedItems = game2AddedItems.filter(item => item.id !== id);
            updateGame2Display();
            syncGame2ToFirebase();
        }
        
        window.removeGame2Removed = function(id) {
            game2RemovedItems = game2RemovedItems.filter(item => item.id !== id);
            updateGame2Display();
            syncGame2ToFirebase();
        }
        
        function updateGame2Display() {
            const addedContainer = document.getElementById('game2AddedItems');
            const removedContainer = document.getElementById('game2RemovedItems');
            const addedCountEl = document.getElementById('game2AddedCount');
            const removedCountEl = document.getElementById('game2RemovedCount');
            
            addedCountEl.textContent = game2AddedItems.length;
            removedCountEl.textContent = game2RemovedItems.length;
            
            // Added items display
            if (game2AddedItems.length === 0) {
                addedContainer.innerHTML = '<p style="color: #666; text-align: center; margin: auto;">No items added</p>';
            } else {
                addedContainer.innerHTML = game2AddedItems.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: white; border-radius: 6px;">
                        <span style="color: #155724; font-weight: 500;">${item.text}</span>
                        <button onclick="removeGame2Added(${item.id})" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">✕</button>
                    </div>
                `).join('');
            }
            
            // Removed items display
            if (game2RemovedItems.length === 0) {
                removedContainer.innerHTML = '<p style="color: #666; text-align: center; margin: auto;">No items removed</p>';
            } else {
                removedContainer.innerHTML = game2RemovedItems.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: white; border-radius: 6px;">
                        <span style="color: #721c24; font-weight: 500;">${item.text}</span>
                        <button onclick="removeGame2Removed(${item.id})" style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">✕</button>
                    </div>
                `).join('');
            }
        }
        
        function syncGame2ToFirebase() {
            if (!database || !window.firebaseDB) return;
            
            const { ref, set } = window.firebaseDB;
            const teamId = teamName.toLowerCase();
            const game2Ref = ref(database, `challenge1/${teamId}/game2`);
            
            set(game2Ref, {
                added: game2AddedItems,
                removed: game2RemovedItems,
                addedCount: game2AddedItems.length,
                removedCount: game2RemovedItems.length,
                lastUpdated: Date.now()
            }).catch(err => console.error('Sync error:', err));
        }
        
        // ==================== END CHALLENGE 1 FUNCTIONS ====================
        
        function backToChallengesFromGame() {
            // Go back from game screen to challenges screen
            if (gameActive && !confirm('Game is in progress! Your progress will be saved. Timer continues for your team. Are you sure you want to go back?')) {
                return;
            }
            
            // Stop the LOCAL timer interval only (Firebase continues for other players)
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            // Set local game as inactive (but don't update Firebase - let it continue)
            gameActive = false;
            
            // Hide game screen and show challenges
            document.getElementById('gameScreen').classList.remove('active');
            document.getElementById('challengesScreen').classList.remove('hidden');
            
            console.log('⏸️ Left game - timer continues in Firebase for team');
        }
        
        async function checkPlayerNameAvailability(nameToCheck) {
            // Check if this player name is already logged in
            if (!database || !window.firebaseDB) {
                return true; // Allow if Firebase not ready
            }
            
            const { ref, get } = window.firebaseDB;
            const activePlayersRef = ref(database, 'activePlayers');
            
            try {
                const snapshot = await get(activePlayersRef);
                if (snapshot.exists()) {
                    const activePlayers = snapshot.val();
                    // Check if this name is already in use
                    for (let pid in activePlayers) {
                        if (activePlayers[pid].name === nameToCheck && activePlayers[pid].isActive) {
                            return false; // Name already in use
                        }
                    }
                }
                return true; // Name available
            } catch (error) {
                console.error('Error checking player name:', error);
                return true; // Allow on error
            }
        }
        
        async function startGameLogin() {
            const enteredPassword = document.getElementById('password').value;
            const passwordError = document.getElementById('passwordError');
            
            if (!enteredPassword) {
                passwordError.textContent = 'Please enter password!';
                passwordError.classList.add('show');
                return;
            }
            
            if (enteredPassword !== CORRECT_PASSWORD) {
                passwordError.textContent = 'Incorrect password! Try again.';
                passwordError.classList.add('show');
                return;
            }
            
            passwordError.classList.remove('show');
            
            // Check if Challenge 4 is already completed
            const isChallenge4Completed = await checkChallenge4CompletionStatus();
            if (isChallenge4Completed) {
                showSubmissionModal('challenge4');
                return;
            }
            
            // Player ID already generated in proceedToPassword()
            // Player already registered in activePlayers in proceedToPassword()
            
            // Update game screen
            document.getElementById('displayTeamName').textContent = `Team: ${teamName}`;
            document.getElementById('displayPlayerName').textContent = `Player: ${playerName}`;
            document.getElementById('passwordScreen').classList.add('hidden');
            document.getElementById('gameScreen').classList.add('active');
            
            // Wait for Firebase to be ready, then connect
            const checkFirebase = setInterval(() => {
                if (database) {
                    clearInterval(checkFirebase);
                    connectToTeam();
                    // Check if game is already active, if not start new game
                    checkAndJoinOrStartGame();
                }
            }, 100);
            
            // Timeout after 5 seconds if Firebase doesn't connect
            setTimeout(() => {
                if (!database) {
                    clearInterval(checkFirebase);
                    alert('Unable to connect to database. Please check your internet connection and Firebase setup.');
                    updateConnectionStatus(false);
                }
            }, 5000);
        }
        
        // Check if Challenge 4 is already completed
        async function checkChallenge4CompletionStatus() {
            if (!database || !window.firebaseDB) return false;
            
            const teamId = teamName.toLowerCase();
            const { ref, get } = window.firebaseDB;
            const gameStateRef = ref(database, `teams/${teamId}/gameState`);
            
            try {
                const snapshot = await get(gameStateRef);
                if (snapshot.exists()) {
                    const state = snapshot.val();
                    return state.completed === true;
                }
                return false;
            } catch (error) {
                console.error('❌ Error checking Challenge 4 completion:', error);
                return false;
            }
        }
        
        // Show submission modal with team's completed submissions
        async function showSubmissionModal(challengeType) {
            if (!database || !window.firebaseDB) return;
            
            const modal = document.getElementById('submissionModal');
            const title = document.getElementById('submissionTitle');
            const subtitle = document.getElementById('submissionSubtitle');
            const body = document.getElementById('submissionBody');
            
            const teamId = teamName.toLowerCase();
            const { ref, get } = window.firebaseDB;
            
            try {
                let content = '';
                
                if (challengeType === 'game1') {
                    title.textContent = '🔒 Game 1 Completed!';
                    subtitle.textContent = `Team ${teamName}'s Memory Items`;
                    
                    const game1Ref = ref(database, `challenge1/${teamId}/game1`);
                    const snapshot = await get(game1Ref);
                    
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        let items = data.items || [];
                        
                        // Convert to array if Firebase stored it as an object
                        if (typeof items === 'object' && !Array.isArray(items)) {
                            items = Object.values(items).filter(item => item !== null && item !== undefined);
                        }
                        
                        // Extract text from item objects (items have {text, id, playerName} structure)
                        items = items.map(item => {
                            if (typeof item === 'object' && item.text) {
                                return item.text;
                            }
                            return String(item);
                        });
                        
                        content = `
                            <div class="submission-section">
                                <h3>📝 Memory Items (${items.length}/25)</h3>
                                ${items.length > 0 ? `
                                    <div class="submission-items">
                                        ${items.map(item => `<div class="submission-item">${item}</div>`).join('')}
                                    </div>
                                ` : '<div class="submission-empty">No items were added</div>'}
                            </div>
                        `;
                    } else {
                        content = '<div class="submission-empty">No submissions found</div>';
                    }
                    
                } else if (challengeType === 'game2') {
                    title.textContent = '🔒 Game 2 Completed!';
                    subtitle.textContent = `Team ${teamName}'s Added & Removed Items`;
                    
                    const game2Ref = ref(database, `challenge1/${teamId}/game2`);
                    const snapshot = await get(game2Ref);
                    
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        let added = data.added || [];
                        let removed = data.removed || [];
                        
                        // Convert to array if Firebase stored it as an object
                        if (typeof added === 'object' && !Array.isArray(added)) {
                            added = Object.values(added).filter(item => item !== null && item !== undefined);
                        }
                        if (typeof removed === 'object' && !Array.isArray(removed)) {
                            removed = Object.values(removed).filter(item => item !== null && item !== undefined);
                        }
                        
                        // Extract text from item objects (items have {text, id, playerName} structure)
                        added = added.map(item => {
                            if (typeof item === 'object' && item.text) {
                                return item.text;
                            }
                            return String(item);
                        });
                        removed = removed.map(item => {
                            if (typeof item === 'object' && item.text) {
                                return item.text;
                            }
                            return String(item);
                        });
                        
                        content = `
                            <div class="submission-section">
                                <h3>➕ Added Items (${added.length}/5)</h3>
                                ${added.length > 0 ? `
                                    <div class="submission-items">
                                        ${added.map(item => `<div class="submission-item">${item}</div>`).join('')}
                                    </div>
                                ` : '<div class="submission-empty">No items added</div>'}
                            </div>
                            <div class="submission-section">
                                <h3>➖ Removed Items (${removed.length}/5)</h3>
                                ${removed.length > 0 ? `
                                    <div class="submission-items">
                                        ${removed.map(item => `<div class="submission-item">${item}</div>`).join('')}
                                    </div>
                                ` : '<div class="submission-empty">No items removed</div>'}
                            </div>
                        `;
                    } else {
                        content = '<div class="submission-empty">No submissions found</div>';
                    }
                    
                } else if (challengeType === 'challenge4') {
                    title.textContent = '🔒 Challenge 4 Completed!';
                    subtitle.textContent = `Team ${teamName}'s House Markings`;
                    
                    const markersRef = ref(database, `teams/${teamId}/markers`);
                    const snapshot = await get(markersRef);
                    
                    if (snapshot.exists()) {
                        const markers = snapshot.val();
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
                        
                        let totalPoints = 0;
                        content = '';
                        
                        for (const room in markers) {
                            const roomMarkers = markers[room];
                            const roomTitle = roomNames[room] || room;
                            
                            content += `<div class="submission-room">
                                <h4>🏠 ${roomTitle}</h4>
                                <div class="submission-markers">`;
                            
                            for (const pointId in roomMarkers) {
                                const marker = roomMarkers[pointId];
                                if (marker && marker.count > 0) {
                                    totalPoints += marker.count;
                                    content += `
                                        <div class="submission-marker">
                                            <div class="submission-marker-id">${pointId}</div>
                                            <div class="submission-marker-count">${marker.count}</div>
                                        </div>
                                    `;
                                }
                            }
                            
                            content += `</div></div>`;
                        }
                        
                        content = `
                            <div class="submission-section">
                                <h3>📊 Total Points Marked: ${totalPoints}</h3>
                            </div>
                            ${content}
                        `;
                    } else {
                        content = '<div class="submission-empty">No markings found</div>';
                    }
                }
                
                body.innerHTML = content;
                modal.classList.add('show');
                
            } catch (error) {
                console.error('❌ Error loading submissions:', error);
                body.innerHTML = '<div class="submission-empty">Error loading submissions</div>';
                modal.classList.add('show');
            }
        }
        
        // Close submission modal
        window.closeSubmissionModal = function() {
            const modal = document.getElementById('submissionModal');
            modal.classList.remove('show');
        }
        
        // Close modal when clicking outside
        document.addEventListener('DOMContentLoaded', function() {
            const modal = document.getElementById('submissionModal');
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        window.closeSubmissionModal();
                    }
                });
            }
        });

        function checkAndJoinOrStartGame() {
            // Check if there's an active game in Firebase before starting new one
            if (!database || !window.firebaseDB) {
                console.error('Firebase not initialized');
                return;
            }
            
            const { ref, get } = window.firebaseDB;
            const teamId = teamName.toLowerCase().replace(/\s+/g, '-');
            const teamDataRef = ref(database, `teams/${teamId}`);
            
            // Get current game state from Firebase
            get(teamDataRef).then((snapshot) => {
                const data = snapshot.val();
                if (data && data.gameActive) {
                    // Game already active - join it with current state
                    console.log('✅ Joining existing game with time:', data.timeRemaining, 'seconds');
                    
                    // Immediately sync all game state from Firebase
                    timeRemaining = data.timeRemaining || 60;
                    bonusAdded = data.bonusAdded || false;
                    gameActive = true;
                    
                    // Sync markers
                    if (data.markers) {
                        markedLocations = data.markers;
                        updateAllRoomProgress();
                        updateTotalCount();
                    }
                    
                    // Update display
                    updateTimerDisplay();
                    document.getElementById('gameOver').style.display = 'none';
                    document.querySelectorAll('.room').forEach(room => {
                        room.classList.remove('disabled');
                    });
                    
                    // Start the timer interval if not already running
                    if (!timerInterval) {
                        timerInterval = setInterval(updateTimer, 1000);
                    }
                    
                    console.log('⏱️ Synced to current game time:', timeRemaining, 'seconds');
                } else {
                    // No active game - start new one
                    console.log('🎮 Starting new game...');
                    setTimeout(() => {
                        startGame();
                    }, 500);
                }
            }).catch((error) => {
                console.error('Error checking game state:', error);
                // On error, try to start game anyway
                setTimeout(() => {
                    startGame();
                }, 500);
            });
        }

        function connectToTeam() {
            if (!database || !window.firebaseDB) {
                console.error('Firebase not initialized');
                return;
            }
            
            const { ref, set, onValue, remove } = window.firebaseDB;
            const teamId = teamName.toLowerCase().replace(/\s+/g, '-');
            teamRef = ref(database, `teams/${teamId}`);
            
            // Listen for changes
            onValue(teamRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Update markers
                    if (data.markers) {
                        markedLocations = data.markers;
                        updateAllRoomProgress();
                        updateTotalCount();
                    }
                    
                    // Update timer
                    if (data.timeRemaining !== undefined) {
                        timeRemaining = data.timeRemaining;
                        updateTimerDisplay();
                    }
                    
                    // Update bonus added state
                    if (data.bonusAdded !== undefined) {
                        bonusAdded = data.bonusAdded;
                    }
                    
                    // Update game state
                    if (data.gameActive !== undefined && data.gameActive !== gameActive) {
                        gameActive = data.gameActive;
                        if (gameActive) {
                            document.getElementById('gameOver').style.display = 'none';
                            document.querySelectorAll('.room').forEach(room => {
                                room.classList.remove('disabled');
                            });
                            if (!timerInterval) {
                                timerInterval = setInterval(updateTimer, 1000);
                            }
                        } else {
                            if (timerInterval) {
                                clearInterval(timerInterval);
                                timerInterval = null;
                            }
                            if (data.timeRemaining <= 0) {
                                document.getElementById('gameOver').style.display = 'block';
                                document.querySelectorAll('.room').forEach(room => {
                                    room.classList.add('disabled');
                                });
                            }
                        }
                    }
                    
                    // Update active players
                    if (data.players) {
                        const playerCount = Object.keys(data.players).length;
                        document.getElementById('activePlayers').textContent = `👥 Active Players: ${playerCount}`;
                    }
                    
                    showSyncIndicator('🔄 Synced');
                }
            });
            
            // Register this player
            const playerRef = ref(database, `teams/${teamId}/players/${playerId}`);
            set(playerRef, {
                name: playerName,
                joinedAt: Date.now()
            });
            
            // Remove player on disconnect
            window.addEventListener('beforeunload', () => {
                if (database && window.firebaseDB && playerId) {
                    const { ref, remove } = window.firebaseDB;
                    // Remove from team players
                    remove(playerRef);
                    // Remove from active players list
                    const playerActiveRef = ref(database, `activePlayers/${playerId}`);
                    remove(playerActiveRef);
                }
            });
            
            showSyncIndicator('✅ Connected to team!');
        }

        function syncToDatabase(updates) {
            if (!database || !window.firebaseDB) {
                console.warn('Firebase not ready, skipping sync');
                return;
            }
            
            showSyncIndicator('🔄 Syncing...');
            
            const { ref, update } = window.firebaseDB;
            const teamId = teamName.toLowerCase().replace(/\s+/g, '-');
            update(ref(database, `teams/${teamId}`), updates).then(() => {
                showSyncIndicator('✅ Synced');
            }).catch((error) => {
                console.error('Sync error:', error);
                showSyncIndicator('❌ Sync failed');
            });
        }

        function openRoom(roomId) {
            if (!gameActive) return;
            
            currentRoom = roomId;
            document.getElementById('modalRoomTitle').textContent = roomNames[roomId];
            document.getElementById('roomModal').classList.add('active');
            
            const grid = document.getElementById('markersGrid');
            grid.innerHTML = '';
            
            for (let i = 1; i <= 9; i++) {
                const marker = document.createElement('div');
                marker.className = 'marker-point';
                marker.dataset.id = i;
                
                const markerData = markedLocations[roomId]?.[i];
                const count = markerData?.count || 0;
                
                // Main number (position/point identifier)
                const mainNumber = document.createElement('div');
                mainNumber.className = 'marker-main-number';
                mainNumber.textContent = count > 0 ? count : '•';
                marker.appendChild(mainNumber);
                
                if (count > 0) {
                    marker.classList.add('marked');
                    
                    // Counter controls
                    const counterWrapper = document.createElement('div');
                    counterWrapper.className = 'marker-counter-wrapper';
                    
                    // Minus button
                    const minusBtn = document.createElement('div');
                    minusBtn.className = 'marker-count-btn';
                    minusBtn.textContent = '−';
                    minusBtn.onclick = (e) => {
                        e.stopPropagation();
                        adjustMarkerCount(roomId, i, -1);
                    };
                    
                    // Plus button
                    const plusBtn = document.createElement('div');
                    plusBtn.className = 'marker-count-btn';
                    plusBtn.textContent = '+';
                    plusBtn.onclick = (e) => {
                        e.stopPropagation();
                        adjustMarkerCount(roomId, i, 1);
                    };
                    
                    counterWrapper.appendChild(minusBtn);
                    counterWrapper.appendChild(plusBtn);
                    marker.appendChild(counterWrapper);
                    
                    // Show who marked it
                    if (markerData.playerName) {
                        const playerLabel = document.createElement('span');
                        playerLabel.className = 'marker-player';
                        playerLabel.textContent = markerData.playerName;
                        marker.appendChild(playerLabel);
                    }
                } else {
                    // Click to initialize with count of 1
                    marker.onclick = () => adjustMarkerCount(roomId, i, 1);
                }
                
                grid.appendChild(marker);
            }
            
            updateRoomCount(roomId);
        }

        function closeRoom() {
            document.getElementById('roomModal').classList.remove('active');
            currentRoom = null;
        }

        function adjustMarkerCount(roomId, markerId, delta) {
            if (!gameActive) return;
            
            // Initialize marker data if not exists
                if (!markedLocations[roomId]) markedLocations[roomId] = {};
            if (!markedLocations[roomId][markerId]) {
                markedLocations[roomId][markerId] = {
                    count: 0,
                    playerName: playerName,
                    playerId: playerId,
                    timestamp: Date.now()
                };
            }
            
            // Adjust count
            const currentCount = markedLocations[roomId][markerId].count || 0;
            const newCount = Math.max(0, currentCount + delta);
            
            if (newCount === 0) {
                // Remove marker if count reaches 0
                delete markedLocations[roomId][markerId];
            } else {
                markedLocations[roomId][markerId].count = newCount;
                markedLocations[roomId][markerId].playerName = playerName;
                markedLocations[roomId][markerId].playerId = playerId;
                markedLocations[roomId][markerId].timestamp = Date.now();
            }
            
            // Update UI counts
            updateRoomCount(roomId);
            updateRoomProgress(roomId);
            updateTotalCount();
            
            // Refresh the room display to show updated counts
            if (currentRoom === roomId) {
                openRoom(roomId);
            }
            
            // Sync to database
            syncToDatabase({ markers: markedLocations });
        }

        // Practice room state (local only, not synced)
        const practiceState = {};

        function adjustPracticeCount(pointId, delta) {
            // Initialize if not exists
            if (!practiceState[pointId]) {
                practiceState[pointId] = 0;
            }
            
            // Adjust count
            const currentCount = practiceState[pointId];
            const newCount = Math.max(0, currentCount + delta);
            practiceState[pointId] = newCount;
            
            // Update UI
            const marker = document.getElementById(`practice${pointId}`);
            if (!marker) return;
            
            // Clear existing content
            marker.innerHTML = '';
            marker.onclick = null;
            
            // Main number
            const mainNumber = document.createElement('div');
            mainNumber.className = 'marker-main-number';
            mainNumber.textContent = newCount > 0 ? newCount : '•';
            marker.appendChild(mainNumber);
            
            if (newCount > 0) {
                marker.classList.add('marked');
                
                // Counter controls
                const counterWrapper = document.createElement('div');
                counterWrapper.className = 'marker-counter-wrapper';
                
                // Minus button
                const minusBtn = document.createElement('div');
                minusBtn.className = 'marker-count-btn';
                minusBtn.textContent = '−';
                minusBtn.onclick = (e) => {
                    e.stopPropagation();
                    adjustPracticeCount(pointId, -1);
                };
                
                // Plus button
                const plusBtn = document.createElement('div');
                plusBtn.className = 'marker-count-btn';
                plusBtn.textContent = '+';
                plusBtn.onclick = (e) => {
                    e.stopPropagation();
                    adjustPracticeCount(pointId, 1);
                };
                
                counterWrapper.appendChild(minusBtn);
                counterWrapper.appendChild(plusBtn);
                marker.appendChild(counterWrapper);
            } else {
                marker.classList.remove('marked');
                marker.onclick = () => adjustPracticeCount(pointId, 1);
            }
        }

        function resetPracticeRoom() {
            // Clear practice state
            for (let key in practiceState) {
                delete practiceState[key];
            }
            
            // Reset all practice markers
            for (let i = 1; i <= 6; i++) {
                const marker = document.getElementById(`practice${i}`);
                if (marker) {
                    marker.classList.remove('marked');
                    marker.innerHTML = '<div class="marker-main-number">•</div>';
                    marker.onclick = () => adjustPracticeCount(i, 1);
                }
            }
        }

        function updateRoomCount(roomId) {
            const count = Object.keys(markedLocations[roomId] || {}).length;
            document.getElementById('roomCount').textContent = count;
        }

        function updateRoomProgress(roomId) {
            const count = Object.keys(markedLocations[roomId] || {}).length;
            document.getElementById(`progress-${roomId}`).textContent = `${count}/9`;
        }

        function updateAllRoomProgress() {
            rooms.forEach(room => updateRoomProgress(room));
        }

        function updateTotalCount() {
            let total = 0;
            rooms.forEach(room => {
                total += Object.keys(markedLocations[room] || {}).length;
            });
            document.getElementById('totalCount').textContent = total;
        }

        function startGame() {
            gameActive = true;
            timeRemaining = initialTimerValue; // Use admin-set value
            bonusAdded = false;
            // No start button in this version - game auto-starts on login
            document.getElementById('gameOver').style.display = 'none';
            
            document.querySelectorAll('.room').forEach(room => {
                room.classList.remove('disabled');
            });
            
            // Clear any existing interval before creating new one
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            timerInterval = setInterval(updateTimer, 1000);
            updateTimerDisplay();
            
            syncToDatabase({
                gameActive: true,
                timeRemaining: timeRemaining,
                bonusAdded: false
            });
        }

        function updateTimer() {
            if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
            
                // Sync timer every second to Firebase
                // This ensures refreshing players always see the current time
                syncToDatabase({ timeRemaining: timeRemaining });
            }
            
            if (timeRemaining <= 0 && !bonusAdded) {
                addBonusTime();
            } else if (timeRemaining <= 0 && bonusAdded) {
                endGame();
            }
        }

        function updateTimerDisplay() {
            // Ensure time doesn't go negative
            const safeTime = Math.max(0, timeRemaining);
            const minutes = Math.floor(safeTime / 60);
            const seconds = safeTime % 60;
            const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            const timerElement = document.getElementById('timer');
            timerElement.textContent = display;
            
            if (timeRemaining <= 30) {
                timerElement.classList.add('warning');
            } else {
                timerElement.classList.remove('warning');
            }
        }

        function addBonusTime() {
            bonusAdded = true;
            const bonusTime = window.bonusTimeValue || 30;
            timeRemaining = bonusTime;
            
            // Update surprise message with actual bonus time
            const surpriseMsg = document.getElementById('surpriseMessage');
            surpriseMsg.innerHTML = `🎉 PLOT TWIST! 🎉<br>You get ${bonusTime} MORE SECONDS!<br>It's not over yet! 😄`;
            
            document.getElementById('surpriseOverlay').classList.add('show');
            surpriseMsg.classList.add('show');
            
            setTimeout(() => {
                document.getElementById('surpriseOverlay').classList.remove('show');
                surpriseMsg.classList.remove('show');
            }, 3000);
            
            syncToDatabase({
                timeRemaining: timeRemaining,
                bonusAdded: true
            });
        }

        function endGame() {
            gameActive = false;
            clearInterval(timerInterval);
            document.getElementById('gameOver').style.display = 'block';
            
            document.querySelectorAll('.room').forEach(room => {
                room.classList.add('disabled');
            });
            
            closeRoom();
            
            // Mark game as completed
            syncToDatabase({ 
                gameActive: false,
                completed: true
            });
            
            console.log('🎉 Game completed! Admin can view results on dashboard.');
        }

        function resetGame() {
            if (!confirm('This will reset the game for ALL team members. Continue?')) {
                return;
            }
            
            gameActive = false;
            clearInterval(timerInterval);
            timeRemaining = initialTimerValue; // Use admin-set value
            bonusAdded = false;
            // No start button in this version
            document.getElementById('gameOver').style.display = 'none';
            
            rooms.forEach(room => {
                markedLocations[room] = {};
                updateRoomProgress(room);
            });
            
            document.querySelectorAll('.room').forEach(room => {
                room.classList.remove('disabled');
            });
            
            updateTotalCount();
            updateTimerDisplay();
            closeRoom();
            
            syncToDatabase({
                markers: markedLocations,
                gameActive: false,
                timeRemaining: 60,
                bonusAdded: false
            });
        }

        function logout() {
            if (gameActive && !confirm('Game is in progress! Are you sure you want to leave?')) {
                return;
            }
            
            if (database && window.firebaseDB && playerId) {
                const { ref, remove } = window.firebaseDB;
                const teamId = teamName.toLowerCase().replace(/\s+/g, '-');
                // Remove from team players
                remove(ref(database, `teams/${teamId}/players/${playerId}`));
                // Remove from active players list
                const playerActiveRef = ref(database, `activePlayers/${playerId}`);
                remove(playerActiveRef);
            }
            
            // Clear sessionStorage
            sessionStorage.removeItem('playerName');
            sessionStorage.removeItem('teamName');
            sessionStorage.removeItem('playerId');
            
            location.reload();
        }

        /* 
        ==========================================
        DEPLOYMENT & USAGE
        ==========================================
        
        CURRENT STATUS: ✅ Firebase Config Added!
        
        NEXT STEP: Add your databaseURL (see instructions at top)
        
        ONCE COMPLETE:
        1. Save this file as index.html
        2. Deploy to:
           - GitHub Pages (free)
           - Netlify (free)  
           - Vercel (free)
           - Or open locally in browser
        
        3. Share the URL with your team
        4. Everyone enters the SAME team name
        5. Each person enters their own player name
        6. Enter password: anvi
        7. Game starts automatically!
        8. Collaborate in real-time!
        
        HOW MULTIPLAYER WORKS:
        - All players with same team name share state
        - Marks sync instantly across all devices
        - Shared timer for the whole team (2 min + 30 sec bonus!)
        - See who marked each location
        - Active player count updates live
        - Game auto-starts when you login
        - Admin can view all team progress on dashboard
        
        TIPS:
        - Open in multiple browser tabs to test
        - Each tab = different player
        - Works across different devices/computers
        - No limit on number of players per team
        
        SECURITY:
        - Current setup: Open access (test mode)
        - Perfect for this game scenario
        - No sensitive data being stored
        - Team names act as simple room codes
        
        TROUBLESHOOTING:
        - If not connecting: Check databaseURL
        - If sync issues: Check browser console (F12)
        - If rules error: Check database rules in Firebase
        - Connection status shown at top of game screen
        
        ==========================================
        */
