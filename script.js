let numPlayers = 2;
let gameVariant = 'base';
let summoningPoints = [];
let lifePoints = [];
let trickResults = [];
let trickWinner = -1;
let currentPhase = 'biddingPhase';

// Base Game Card properties
let trumpCards = ['Q♣', 'Q♠', 'Q♥', 'Q♦', 'J♣', 'J♠', 'J♥', 'J♦', 'A♦', '10♦', 'K♦', '9♦', '8♦', '7♦'];
let failCards = ['A', '10', 'K', '9', '8', '7'];
let cardStrengths = {};
let cardPoints = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2, '9': 0, '8': 0, '7': 0 };

// Define card strengths for the base game
trumpCards.forEach((card, index) => cardStrengths[card] = 14 - index); // 14 down to 1
failCards.forEach(card => {
    ['♣', '♠', '♥'].forEach(suit => cardStrengths[card + suit] = 6 - failCards.indexOf(card)); // 6 down to 1
});

// Yu-Gi-Oh! Card Point Values based on Levels
const yugiohCardPoints = {
    8: 3, // Level 8 or higher = 3 points
    7: 3,
    6: 2, // Level 5-6 = 2 points
    5: 2,
    4: 1, // Level 3-4 = 1 point
    3: 1,
    2: 0, // Level 1-2 = 0 points
    1: 0
};

// Game Initialization
function initializeGame() {
    numPlayers = parseInt(document.getElementById('numPlayers').value);
    gameVariant = document.getElementById('gameVariant').value;

    if (gameVariant === 'yugioh') {
        summoningPoints = new Array(numPlayers).fill(5000); // In Yu-Gi-Oh! variant, start with 5000 summoning points
    } else {
        summoningPoints = new Array(numPlayers).fill(1000); // Default summoning points for base game
    }
    
    lifePoints = new Array(numPlayers).fill(8000); // 8000 life points for all players

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
                <select id="player${i}-bid">
                    <option value="pass">Pass</option>
                    <option value="pickup">Pick Up</option>
                </select>
            </div>
        `;
    }
}

function endBiddingPhase() {
    // Process bidding results here
    // For simplicity, we'll move to the Trick Taking Phase
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

    if (gameVariant === 'yugioh') {
        // Use Yu-Gi-Oh! card levels and attributes for trick-taking inputs
        for (let i = 1; i <= numPlayers; i++) {
            trickTakingDiv.innerHTML += `
                <div class="player-section">
                    Player ${i}
                    Card Level:
                    <select id="player${i}-card-level">
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                        <option value="5">Level 5</option>
                        <option value="6">Level 6</option>
                        <option value="7">Level 7</option>
                        <option value="8">Level 8</option>
                    </select>
                    Attribute:
                    <select id="player${i}-attribute">
                        <option value="FIRE">FIRE</option>
                        <option value="WATER">WATER</option>
                        <option value="EARTH">EARTH</option>
                        <option value="WIND">WIND</option>
                        <option value="LIGHT">LIGHT</option>
                        <option value="DARK">DARK</option>
                    </select>
                </div>
            `;
        }
    } else {
        // Use traditional base game trick-taking inputs
        for (let i = 1; i <= numPlayers; i++) {
            trickTakingDiv.innerHTML += `
                <div class="player-section">
                    Player ${i}
                    Card Rank:
                    <select id="player${i}-card-rank">
                        <option value="A">Ace</option>
                        <option value="10">Ten</option>
                        <option value="K">King</option>
                        <option value="Q">Queen</option>
                        <option value="J">Jack</option>
                        <option value="9">Nine</option>
                        <option value="8">Eight</option>
                        <option value="7">Seven</option>
                    </select>
                    Suit:
                    <select id="player${i}-card-suit">
                        <option value="♣">Clubs</option>
                        <option value="♠">Spades</option>
                        <option value="♥">Hearts</option>
                        <option value="♦">Diamonds</option>
                    </select>
                </div>
            `;
        }
    }
}

function calculateTrickResults() {
    let highestValue = -1;
    trickWinner = -1;

    if (gameVariant === 'yugioh') {
        // Determine winner based on the highest-level card in Yu-Gi-Oh! variant
        for (let i = 1; i <= numPlayers; i++) {
            const level = parseInt(document.getElementById(`player${i}-card-level`).value);
            if (level > highestValue) {
                highestValue = level;
                trickWinner = i;
            }
        }
        document.getElementById('trickResult').innerHTML = `Player ${trickWinner} wins the trick with a Level ${highestValue} card!`;
        updateSummoningPointsFromTricks(highestValue);
    } else {
        // Base game logic for determining the trick winner
        for (let i = 1; i <= numPlayers; i++) {
            const rank = document.getElementById(`player${i}-card-rank`).value;
            const suit = document.getElementById(`player${i}-card-suit`).value;
            const card = rank + suit;
            const strength = cardStrengths[card] || 0;
            if (strength > highestValue) {
                highestValue = strength;
                trickWinner = i;
            }
        }
        document.getElementById('trickResult').innerHTML = `Player ${trickWinner} wins the trick with a ${document.getElementById(`player${trickWinner}-card-rank`).value} of ${document.getElementById(`player${trickWinner}-card-suit`).value}!`;
        const winnerRank = document.getElementById(`player${trickWinner}-card-rank`).value;
        const pointsEarned = cardPoints[winnerRank] || 0;
        updateSummoningPointsFromTricks(pointsEarned);
    }
}

function updateSummoningPointsFromTricks(pointsEarned) {
    const points = pointsEarned * 100;
    summoningPoints[trickWinner - 1] += points;
    updatePlayerStats();
}

function endTrickTakingPhase() {
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
                Monster Level to Summon:
                <input type="number" id="player${i}-summon-level" min="1" max="8" value="1">
                Summoning Cost: <span id="player${i}-summon-cost">200</span>
            </div>
        `;
    }

    updateSummoningCosts();
}

function updateSummoningCosts() {
    for (let i = 1; i <= numPlayers; i++) {
        const levelInput = document.getElementById(`player${i}-summon-level`);
        const costSpan = document.getElementById(`player${i}-summon-cost`);
        levelInput.addEventListener('input', () => {
            const level = parseInt(levelInput.value);
            const cost = level * 200;
            costSpan.innerText = cost;
        });
    }
}

function endSummoningPhase() {
    for (let i = 1; i <= numPlayers; i++) {
        const level = parseInt(document.getElementById(`player${i}-summon-level`).value);
        const summoningCost = level * 200;

        // Deduct summoning points
        if (summoningPoints[i - 1] >= summoningCost) {
            summoningPoints[i - 1] -= summoningCost;
        } else {
            alert(`Player ${i} does not have enough summoning points!`);
        }
    }

    updatePlayerStats();
    moveToNextPhase('summoningPhase', 'battlePhase');
}

// Battle Phase
function generateBattleInputs() {
    const battleDiv = document.getElementById('battleInputs');
    battleDiv.innerHTML = "";

    for (let i = 1; i <= numPlayers; i++) {
        battleDiv.innerHTML += `
            <div class="player-section">
                Player ${i}
                Attack Target (Player Number):
                <input type="number" id="player${i}-attack-target" min="1" max="${numPlayers}" value="${(i % numPlayers) + 1}">
                Attack Points:
                <input type="number" id="player${i}-attack-points" min="0" value="0">
            </div>
        `;
    }
}

function endBattlePhase() {
    // Simple battle resolution for demonstration purposes
    for (let i = 1; i <= numPlayers; i++) {
        const targetPlayer = parseInt(document.getElementById(`player${i}-attack-target`).value);
        const attackPoints = parseInt(document.getElementById(`player${i}-attack-points`).value);

        if (targetPlayer >= 1 && targetPlayer <= numPlayers && targetPlayer !== i) {
            lifePoints[targetPlayer - 1] -= attackPoints;
        }
    }

    updatePlayerStats();
    checkForWinner();
    moveToNextPhase('battlePhase', 'endPhase');
}

function checkForWinner() {
    for (let i = 0; i < numPlayers; i++) {
        if (lifePoints[i] <= 0) {
            alert(`Player ${i + 1} has been defeated!`);
        }
    }
}

function startNextRound() {
    // Reset necessary variables or proceed as per game rules
    moveToNextPhase('endPhase', 'trickTakingPhase');
    generateTrickTakingInputs();
}

// Move to next phase utility function
function moveToNextPhase(currentPhase, nextPhase) {
    document.getElementById(currentPhase).classList.add('hidden');
    document.getElementById(nextPhase).classList.remove('hidden');

    // Initialize the next phase if needed
    switch (nextPhase) {
        case 'summoningPhase':
            generateSummoningInputs();
            break;
        case 'battlePhase':
            generateBattleInputs();
            break;
        case 'trickTakingPhase':
            generateTrickTakingInputs();
            break;
        default:
            break;
    }
}

// Attach event listeners to the buttons
document.getElementById('startGame').addEventListener('click', initializeGame);
document.getElementById('calculateTrickResults').addEventListener('click', calculateTrickResults);
document.getElementById('endTrickTakingPhase').addEventListener('click', endTrickTakingPhase);
document.getElementById('endSummoningPhase').addEventListener('click', endSummoningPhase);
document.getElementById('endBattlePhase').addEventListener('click', endBattlePhase);
