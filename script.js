let numPlayers = 2;
let gameVariant = 'base';
let summoningPoints = [];
let lifePoints = [];
let trickResults = [];
let trickWinner = -1;
let currentPhase = 'biddingPhase'; // Track the current phase

// Card properties for trick-taking phase (Sheepshead)
let trumpCards = ['Q♣', 'Q♠', 'Q♥', 'Q♦', 'J♣', 'J♠', 'J♥', 'J♦', 'A♦', '10♦', 'K♦', '9♦', '8♦', '7♦'];
let failCards = ['A', '10', 'K', '9', '8', '7'];
let cardStrengths = {};
let cardPoints = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2, '9': 0, '8': 0, '7': 0 };

// Define card strengths based on the order in Sheepshead
trumpCards.forEach((card, index) => cardStrengths[card] = 14 - index); // 14 down to 1
failCards.forEach(card => {
    ['♣', '♠', '♥'].forEach(suit => cardStrengths[card + suit] = 6 - failCards.indexOf(card)); // 6 down to 1
});

// Initialize game settings
function initializeGame() {
    numPlayers = parseInt(document.getElementById('numPlayers').value);
    gameVariant = document.getElementById('gameVariant').value;

    // Set initial points for Yu-Gi-Oh! and Base game variants
    summoningPoints = new Array(numPlayers).fill(gameVariant === 'yugioh' ? 5000 : 1000);
    lifePoints = new Array(numPlayers).fill(8000);

    updatePlayerStats();

    if (numPlayers === 2 || gameVariant === 'yugioh') {
        document.getElementById('biddingPhase').classList.add('hidden');
        startTrickTakingPhase();
    } else {
        document.getElementById('biddingPhase').classList.remove('hidden');
        generateBiddingOptions();
    }

    document.getElementById('gameSetup').classList.add('hidden');
    document.getElementById('playerStatsOverview').classList.remove('hidden');
}

// Change game variant handler
function changeGameVariant() {
    gameVariant = document.getElementById('gameVariant').value;
}

// Update player stats display
function updatePlayerStats() {
    let stats = '';
    for (let i = 0; i < numPlayers; i++) {
        stats += `Player ${i + 1} - Life Points: ${lifePoints[i]}, Summoning Points: ${summoningPoints[i]}<br>`;
    }
    document.getElementById('playerStats').innerHTML = stats;
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
    moveToNextPhase('biddingPhase', 'trickTakingPhase');
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

function calculateTrickResults() {
    // Placeholder logic to determine winner (needs real implementation)
    trickWinner = Math.floor(Math.random() * numPlayers) + 1;
    document.getElementById('trickResult').innerHTML = `Player ${trickWinner} wins the trick!`;
}

function updateSummoningPointsFromTricks() {
    let trickPoints = gameVariant === 'yugioh' ? 500 : 100; // Award more points for Yu-Gi-Oh! variant
    summoningPoints[trickWinner - 1] += trickPoints;
    updatePlayerStats();
}

function endTrickTakingPhase() {
    calculateTrickResults();
    updateSummoningPointsFromTricks();
    moveToNextPhase('trickTakingPhase', 'summoningPhase');
}

// Summoning Phase
function generateSummoningInputs() {
    const summoningDiv = document.getElementById('summoningInputs');
    summoningDiv.innerHTML = "";
    for (let i = 1; i <= numPlayers; i++) {
        summoningDiv.innerHTML += `
            <div class="player-section">
                Player ${i}
                Card Level:
                <select class="card-level">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                    <option>7</option>
                </select>
                ATK:
                <input type="number" class="card-atk" min="0">
                DEF:
                <input type="number" class="card-def" min="0">
            </div>
        `;
    }
}

function endSummoningPhase() {
    calculateSummoningCosts();
    moveToNextPhase('summoningPhase', 'battlePhase');
}

// Calculate summoning costs based on card attributes
function calculateSummoningCosts() {
    const players = document.getElementsByClassName('player-section');
    for (let i = 0; i < players.length; i++) {
        let cardLevel = parseInt(players[i].querySelector('.card-level').value);
        let cardATK = parseInt(players[i].querySelector('.card-atk').value) || 0;
        let cardDEF = parseInt(players[i].querySelector('.card-def').value) || 0;

        // Example summoning cost formula: (Level * 100) + (ATK / 10) + (DEF / 10)
        let summoningCost = (cardLevel * 100) + Math.floor(cardATK / 10) + Math.floor(cardDEF / 10);

        // Deduct summoning points for each player based on summoning cost
        summoningPoints[i] -= summoningCost;
    }
    updatePlayerStats();
}

// Battle Phase
function endBattlePhase() {
    if (gameVariant === 'yugioh') {
        alert('Yu-Gi-Oh! Battle Phase mechanics implemented here.');
    }
    moveToNextPhase('battlePhase', 'endPhase');
}

// Move to next phase utility function
function moveToNextPhase(currentPhase, nextPhase) {
    document.getElementById(currentPhase).classList.add('hidden');
    document.getElementById(nextPhase).classList.remove('hidden');
}

// Next Round handler
function nextRound() {
    moveToNextPhase('endPhase', 'biddingPhase');
}

// Attach event listeners to the buttons
document.getElementById('startGame').addEventListener('click', initializeGame);
document.getElementById('endBiddingPhase').addEventListener('click', endBiddingPhase);
document.getElementById('endTrickTakingPhase').addEventListener('click', endTrickTakingPhase);
document.getElementById('calculateTrickResults').addEventListener('click', calculateTrickResults);
document.getElementById('endSummoningPhase').addEventListener('click', endSummoningPhase);
document.getElementById('endBattlePhase').addEventListener('click', endBattlePhase);
document.getElementById('nextRound').addEventListener('click', nextRound);
