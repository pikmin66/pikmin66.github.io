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
    updateLifePointsOverview();
    updateSummoningPointsOverview();
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
                    <option value="pass">Pass</option>
                    <option value="pick">Pick Up</option>
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
                    <label>Card Attribute:</label>
                    <select>
                        <option value="FIRE">FIRE</option>
                        <option value="WATER">WATER</option>
                        <option value="WIND">WIND</option>
                        <option value="EARTH">EARTH</option>
                        <option value="LIGHT">LIGHT</option>
                        <option value="DARK">DARK</option>
                    </select>
                    <label>Card Level:</label>
                    <input type="number" min="1" max="12">
                </div>
            `;
        } else {
            trickTakingDiv.innerHTML += `
                <div class="player-section">
                    Player ${i}
                    <label>Card Rank:</label>
                    <select>
                        <option value="A">Ace</option>
                        <option value="10">Ten</option>
                        <option value="K">King</option>
                        <option value="Q">Queen</option>
                        <option value="J">Jack</option>
                        <option value="9">Nine</option>
                        <option value="8">Eight</option>
                        <option value="7">Seven</option>
                    </select>
                    <label>Suit:</label>
                    <select>
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

// Additional functions for calculating summoning points, updating points, and handling phases follow...
