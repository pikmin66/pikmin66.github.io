let numPlayers = 2;
let gameVariant = 'base';
let summoningPoints = [];
let lifePoints = [];
let trickResults = [];
let trickWinner = -1;

// Card properties
let trumpCards = ['Q♣', 'Q♠', 'Q♥', 'Q♦', 'J♣', 'J♠', 'J♥', 'J♦', 'A♦', '10♦', 'K♦', '9♦', '8♦', '7♦'];
let failCards = ['A', '10', 'K', '9', '8', '7'];
let cardStrengths = {};
let cardPoints = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2, '9': 0, '8': 0, '7': 0 };

// Define card strengths based on the order in Sheepshead
trumpCards.forEach((card, index) => cardStrengths[card] = 14 - index); // 14 down to 1
failCards.forEach(card => {
    ['♣', '♠', '♥'].forEach(suit => cardStrengths[card + suit] = 6 - failCards.indexOf(card)); // 6 down to 1
});

// Game Initialization
function initializeGame() {
    numPlayers = parseInt(document.getElementById('numPlayers').value);
    gameVariant = document.getElementById('gameVariant').value;

    // Initialize summoning points and life points for each player
    summoningPoints = new Array(numPlayers).fill(1000); // Each player starts with 1000 summoning points
    lifePoints = new Array(numPlayers).fill(8000); // Each player starts with 8000 life points

    // Start with the trick-taking phase if only 2 players or Yu-Gi-Oh! variant; otherwise, go through bidding phase first
    if (numPlayers === 2 || gameVariant === 'yugioh') {
        document.getElementById('biddingPhase').classList.add('hidden');
        startTrickTakingPhase();
    } else {
        document.getElementById('biddingPhase').classList.remove('hidden');
        generateBiddingOptions();
    }

    document.getElementById('gameSetup').classList.add('hidden');
    updatePlayerStatsDisplay();
}

function changeGameVariant() {
    gameVariant = document.getElementById('gameVariant').value;
}

// Bidding Phase
function generateBiddingOptions() {
    const biddingDiv = document.getElementById('biddingOptions');
    biddingDiv.innerHTML = "";
    for (let i = 1; i <= numPlayers; i++) {
        biddingDiv.innerHTML += `
            <div class="player-section">
                Player ${i}
                <select>
                    <option>Pass</option>
                    <option>Pick Up</option>
                </select>
            </div>
        `;
    }
}

function endBiddingPhase() {
    document.getElementById('biddingPhase').classList.add('hidden');
    startTrickTakingPhase();
}

// Trick Taking Phase
function startTrickTakingPhase() {
    document.getElementById('trickTakingPhase').classList.remove('hidden');
    generateTrickTakingInputs();
}

function generateTrickTakingInputs() {
    const trickTakingDiv = document.getElementById('trickTakingInputs');
    trickTakingDiv.innerHTML = "";
    for (let i = 1; i <= numPlayers; i++) {
        if (gameVariant === 'yugioh') {
            trickTakingDiv.innerHTML += `
                <div class="player-section">
                    Player ${i}
                    Card Attribute:
                    <select>
                        <option>FIRE</option>
                        <option>WATER</option>
                        <option>WIND</option>
                        <option>EARTH</option>
                        <option>LIGHT</option>
                        <option>DARK</option>
                    </select>
                    Card Level: <input type="number" min="1" max="12" value="1">
                </div>
            `;
        } else {
            trickTakingDiv.innerHTML += `
                <div class="player-section">
                    Player ${i}
                    Card Rank:
                    <select>
                        <option>Ace</option>
                        <option>Ten</option>
                        <option>King</option>
                        <option>Queen</option>
                        <option>Jack</option>
                        <option>Nine</option>
                        <option>Eight</option>
                        <option>Seven</option>
                    </select>
                    Suit:
                    <select>
                        <option>Clubs</option>
                        <option>Spades</option>
                        <option>Hearts</option>
                        <option>Diamonds</option>
                    </select>
                </div>
            `;
        }
    }
}

function calculateTrickResults() {
    let results = [];
    let highestStrength = -1;
    trickWinner = -1;

    const trickTakingInputs = document.querySelectorAll('#trickTakingInputs .player-section');
    trickTakingInputs.forEach((input, index) => {
        let card, suit;
        if (gameVariant === 'yugioh') {
            const attribute = input.querySelector('select').value;
            const level = parseInt(input.querySelector('input').value);
            card = `Level ${level} ${attribute}`;
            suit = attribute; // Treat attribute as the suit equivalent
        } else {
            const rank = input.querySelectorAll('select')[0].value;
            suit = input.querySelectorAll('select')[1].value;
            card = `${rank} of ${suit}`;
        }

        const cardStrength = cardStrengths[card] || 0;
        results.push({ player: index + 1, card, cardStrength });

        if (cardStrength > highestStrength) {
            highestStrength = cardStrength;
            trickWinner = index + 1;
        }
    });

    document.getElementById('trickResult').innerHTML = `Player ${trickWinner} wins the trick with the highest strength card!`;
    trickResults = results;
}

// Update Summoning Points based on Trick Results
function updateSummoningPointsFromTricks() {
    let trickPoints = 0;
    trickResults.forEach(result => {
        let pointsEarned;
        if (gameVariant === 'yugioh') {
            const level = parseInt(result.card.split(' ')[1]); // Use the level for summoning points in Yu-Gi-Oh!
            pointsEarned = level;
        } else {
            pointsEarned = cardPoints[result.card.split(' ')[0]] || 0; // First character of card is the rank
        }
        trickPoints += parseInt(pointsEarned) * 100; // Multiply by 100 to get summoning points
    });

    summoningPoints[trickWinner - 1] += trickPoints; // Award points to the trick winner
    updateSummoningPointsOverview(); // Update summoning points display
}

function generateSummoningInputs() {
    const summoningDiv = document.getElementById('summoningInputs');
    summoningDiv.innerHTML = "";
    for (let i = 1; i <= numPlayers; i++) {
        summoningDiv.innerHTML += `
            <div class="player-section">
                Player ${i}
                Card Level: <input type="number" min="1" max="12" value="1">
                ATK: <input type="number" min="0" value="0">
                DEF: <input type="number" min="0" value="0">
            </div>
        `;
    }
}

function updateSummoningPointsOverview() {
    const overviewDiv = document.getElementById('summoningPointsOverview');
    overviewDiv.innerHTML = '<h3>Summoning Points Overview:</h3>';
    for (let i = 0; i < numPlayers; i++) {
        overviewDiv.innerHTML += `Player ${i + 1}: ${summoningPoints[i]} points<br>`;
    }
}

function updatePlayerStatsDisplay() {
    const playerStatsDiv = document.getElementById('playerStats');
    playerStatsDiv.innerHTML = '<h3>Player Stats</h3>';
    for (let i = 0; i < numPlayers; i++) {
        playerStatsDiv.innerHTML += `Player ${i + 1}: Life Points: ${lifePoints[i]}, Summoning Points: ${summoningPoints[i]}<br>`;
    }
}

function endTrickTakingPhase() {
    calculateTrickResults();
    updateSummoningPointsFromTricks();
    document.getElementById('trickTakingPhase').classList.add('hidden');
    document.getElementById('summoningPhase').classList.remove('hidden');
    generateSummoningInputs();
    updateSummoningPointsOverview();
}

function endSummoningPhase() {
    document.getElementById('summoningPhase').classList.add('hidden');
    document.getElementById('battlePhase').classList.remove('hidden');
}

function endBattlePhase() {
    document.getElementById('battlePhase').classList.add('hidden');
    document.getElementById('endPhase').classList.remove('hidden');
}

function nextRound() {
    document.getElementById('endPhase').classList.add('hidden');
    initializeGame(); // Restart the game for the next round
}
