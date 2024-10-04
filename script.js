let numPlayers = 2;
let gameVariant = 'base';
let summoningPoints = [];
let trickResults = [];
let trickWinner = -1;

let trumpCards = ['Q♣', 'Q♠', 'Q♥', 'Q♦', 'J♣', 'J♠', 'J♥', 'J♦', 'A♦', '10♦', 'K♦', '9♦', '8♦', '7♦'];
let failCards = ['A', '10', 'K', '9', '8', '7'];
let cardStrengths = {};
let cardPoints = { 'A': 11, '10': 10, 'K': 4, 'Q': 3, 'J': 2, '9': 0, '8': 0, '7': 0 };

// Define card strengths based on the order in Sheepshead
trumpCards.forEach((card, index) => cardStrengths[card] = 14 - index);
failCards.forEach(card => {
    ['♣', '♠', '♥'].forEach(suit => cardStrengths[card + suit] = 6 - failCards.indexOf(card));
});

// Game Initialization
function initializeGame() {
    numPlayers = parseInt(document.getElementById('numPlayers').value);
    gameVariant = document.getElementById('gameVariant').value;

    summoningPoints = new Array(numPlayers).fill(1000); // Each player starts with 1000 summoning points

    if (numPlayers === 2 || gameVariant === 'yugioh') {
        document.getElementById('biddingPhase').classList.add('hidden');
        startTrickTakingPhase();
    } else {
        document.getElementById('biddingPhase').classList.remove('hidden');
        generateBiddingOptions();
    }

    document.getElementById('gameSetup').classList.add('hidden');
}

function generateBiddingOptions() {
    const biddingDiv = document.getElementById('biddingOptions');
    biddingDiv.innerHTML = "";
    for (let i = 1; i <= numPlayers; i++) {
        biddingDiv.innerHTML += `
            <div class="player-section">
                Player ${i}
                <select id="bidPlayer${i}">
                    <option value="pass">Pass</option>
                    <option value="pickUp">Pick Up</option>
                </select>
            </div>
        `;
    }
}

function endBiddingPhase() {
    document.getElementById('biddingPhase').classList.add('hidden');
    startTrickTakingPhase();
}

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
                <select id="cardRankPlayer${i}">
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
                <select id="cardSuitPlayer${i}">
                    <option value="Clubs">Clubs</option>
                    <option value="Spades">Spades</option>
                    <option value="Hearts">Hearts</option>
                    <option value="Diamonds">Diamonds</option>
                </select>
            </div>
        `;
    }
}

function calculateTrickResults() {
    let results = [];
    let highestStrength = -1;
    trickWinner = -1;

    for (let i = 1; i <= numPlayers; i++) {
        let rank = document.getElementById(`cardRankPlayer${i}`).value;
        let suit = document.getElementById(`cardSuitPlayer${i}`).value;
        let card = rank + suit;
        let cardStrength = cardStrengths[card] || 0;

        results.push({ player: i, card: card, strength: cardStrength });

        if (cardStrength > highestStrength) {
            highestStrength = cardStrength;
            trickWinner = i;
        }
    }

    document.getElementById('trickResult').innerHTML = `Player ${trickWinner} wins the trick!`;
    trickResults = results;
}

function updateSummoningPointsFromTricks() {
    let trickPoints = 0;
    trickResults.forEach(result => {
        let pointsEarned = cardPoints[result.card[0]] || 0; // Use the card's rank to determine points
        trickPoints += pointsEarned * 100; // Multiply by 100 to get summoning points
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
                Card Level: <input type="number" id="levelPlayer${i}" min="1" max="12"><br>
                ATK: <input type="number" id="atkPlayer${i}" min="0"><br>
                DEF: <input type="number" id="defPlayer${i}" min="0"><br>
                <button onclick="summonCard(${i})">Summon Card</button>
            </div>
        `;
    }
}

function summonCard(player) {
    let level = parseInt(document.getElementById(`levelPlayer${player}`).value);
    let cost = level * 200; // Summoning cost = level * 200 summoning points

    if (summoningPoints[player - 1] >= cost) {
        summoningPoints[player - 1] -= cost;
        alert(`Player ${player} successfully summoned a card with Level ${level}`);
    } else {
        alert(`Player ${player} does not have enough summoning points.`);
    }
    updateSummoningPointsOverview();
}

function updateSummoningPointsOverview() {
    const overviewDiv = document.getElementById('summoningPointsOverview');
    overviewDiv.innerHTML = '<h3>Summoning Points Overview:</h3>';
    for (let i = 0; i < numPlayers; i++) {
        overviewDiv.innerHTML += `Player ${i + 1}: ${summoningPoints[i]} points<br>`;
    }
}

function endTrickTakingPhase() {
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