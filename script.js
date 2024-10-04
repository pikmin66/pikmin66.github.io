// Variables
let numPlayers = 2;
let gameVariant = 'base';
let summoningPoints = [];
let lifePoints = [];
let trickResults = [];
let trickWinner = -1;

// Card properties and strength settings
let trumpCards = ['Q♣', 'Q♠', 'Q♥', 'Q♦', 'J♣', 'J♠', 'J♥', 'J♦', 'A♦', '10♦', 'K♦', '9♦', '8♦', '7♦'];
let failCards = ['A', '10', 'K', '9', '8', '7'];
let cardStrengths = {};
let cardPoints = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2, '9': 0, '8': 0, '7': 0 };

// Initialize card strengths based on Sheepshead rules
trumpCards.forEach((card, index) => cardStrengths[card] = 14 - index);
failCards.forEach(card => {
    ['♣', '♠', '♥'].forEach(suit => cardStrengths[card + suit] = 6 - failCards.indexOf(card));
});

// Initialize Game
function initializeGame() {
    numPlayers = parseInt(document.getElementById('numPlayers').value);
    gameVariant = document.getElementById('gameVariant').value;

    // Initialize player stats
    summoningPoints = new Array(numPlayers).fill(1000); // Initial summoning points
    lifePoints = new Array(numPlayers).fill(8000); // Initial life points for each player

    // Display player stats
    updatePlayerStats();

    // Set up phase visibility
    hideAllPhases();
    if (numPlayers === 2 || gameVariant === 'yugioh') {
        startTrickTakingPhase();
    } else {
        document.getElementById('biddingPhase').classList.remove('hidden');
        generateBiddingOptions();
    }
}

// Hide all phases
function hideAllPhases() {
    document.getElementById('biddingPhase').classList.add('hidden');
    document.getElementById('trickTakingPhase').classList.add('hidden');
    document.getElementById('summoningPhase').classList.add('hidden');
    document.getElementById('battlePhase').classList.add('hidden');
    document.getElementById('endPhase').classList.add('hidden');
    document.getElementById('gameSetup').classList.add('hidden');
}

// Update Player Stats Display
function updatePlayerStats() {
    const statsDiv = document.getElementById('playerStats');
    statsDiv.innerHTML = '<h2>Player Stats</h2>';
    for (let i = 0; i < numPlayers; i++) {
        statsDiv.innerHTML += `Player ${i + 1} - Life Points: ${lifePoints[i]}, Summoning Points: ${summoningPoints[i]}<br>`;
    }
}

// Bidding Phase
function generateBiddingOptions() {
    const biddingDiv = document.getElementById('biddingOptions');
    biddingDiv.innerHTML = '';
    for (let i = 1; i <= numPlayers; i++) {
        biddingDiv.innerHTML += `
            <div class="player-section">
                Player ${i}
                <button onclick="passBid(${i})">Pass</button>
                <button onclick="pickUpBid(${i})">Pick Up</button>
            </div>
        `;
    }
}

function passBid(player) {
    alert(`Player ${player} passes`);
}

function pickUpBid(player) {
    alert(`Player ${player} picks up the bid`);
    endBiddingPhase();
}

function endBiddingPhase() {
    hideAllPhases();
    startTrickTakingPhase();
}

// Trick Taking Phase
function startTrickTakingPhase() {
    hideAllPhases();
    document.getElementById('trickTakingPhase').classList.remove('hidden');
    generateTrickTakingInputs();
}

function generateTrickTakingInputs() {
    const trickTakingDiv = document.getElementById('trickTakingInputs');
    trickTakingDiv.innerHTML = '';
    for (let i = 1; i <= numPlayers; i++) {
        if (gameVariant === 'yugioh') {
            trickTakingDiv.innerHTML += `
                <div class="player-section">
                    Player ${i}
                    Card Attribute:
                    <select id="attribute-${i}">
                        <option value="FIRE">FIRE</option>
                        <option value="WATER">WATER</option>
                        <option value="WIND">WIND</option>
                        <option value="EARTH">EARTH</option>
                        <option value="LIGHT">LIGHT</option>
                        <option value="DARK">DARK</option>
                    </select>
                    Card Level:
                    <input type="number" id="level-${i}" min="1" max="12">
                </div>
            `;
        } else {
            trickTakingDiv.innerHTML += `
                <div class="player-section">
                    Player ${i}
                    Card Rank:
                    <select id="rank-${i}">
                        <option value="Ace">Ace</option>
                        <option value="Ten">Ten</option>
                        <option value="King">King</option>
                        <option value="Queen">Queen</option>
                        <option value="Jack">Jack</option>
                        <option value="Nine">Nine</option>
                        <option value="Eight">Eight</option>
                        <option value="Seven">Seven</option>
                    </select>
                    Suit:
                    <select id="suit-${i}">
                        <option value="Clubs">Clubs</option>
                        <option value="Spades">Spades</option>
                        <option value="Hearts">Hearts</option>
                        <option value="Diamonds">Diamonds</option>
                    </select>
                </div>
            `;
        }
    }
}

// Calculate Trick Results and Update Summoning Points
function calculateTrickResults() {
    let highestStrength = -1;
    trickWinner = -1;

    // Calculate trick results based on card strengths
    for (let i = 1; i <= numPlayers; i++) {
        let card;
        if (gameVariant === 'yugioh') {
            const level = parseInt(document.getElementById(`level-${i}`).value);
            card = level; // Use level for card strength in Yu-Gi-Oh
        } else {
            const rank = document.getElementById(`rank-${i}`).value;
            const suit = document.getElementById(`suit-${i}`).value;
            card = `${rank}${suit}`;
        }

        const cardStrength = cardStrengths[card] || 0;
        if (cardStrength > highestStrength) {
            highestStrength = cardStrength;
            trickWinner = i;
        }
    }

    if (trickWinner !== -1) {
        document.getElementById('trickResult').innerHTML = `Player ${trickWinner} wins the trick!`;
        updateSummoningPointsFromTricks(trickWinner);
    }
}

// Update Summoning Points dynamically after trick-taking phase
function updateSummoningPointsFromTricks(winner) {
    let trickPoints = 0;

    for (let i = 1; i <= numPlayers; i++) {
        let pointsEarned = 0;
        if (gameVariant === 'yugioh') {
            const level = parseInt(document.getElementById(`level-${i}`).value);
            pointsEarned = level * 100; // Convert level to summoning points in Yu-Gi-Oh
        } else {
            const rank = document.getElementById(`rank-${i}`).value;
            pointsEarned = cardPoints[rank] || 0;
            trickPoints += pointsEarned * 100;
        }

        // Update summoning points of the winner
        summoningPoints[winner - 1] += trickPoints;
    }

    updatePlayerStats();
}

// End Trick Taking Phase and Move to Summoning Phase
function endTrickTakingPhase() {
    hideAllPhases();
    document.getElementById('summoningPhase').classList.remove('hidden');
    generateSummoningInputs();
}

// Summoning Phase and Further Adjustments...
