let numPlayers = 2;
let gameVariant = 'base';
let summoningPoints = [];
let lifePoints = [];
let gamePoints = [];
let trickResults = [];
let trickWinner = -1;
let currentPhase = 'biddingPhase';
let playersMonsters = [];
let playersAlive = [];
let picker = null;
let partner = null;

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
    gamePoints = new Array(numPlayers).fill(0); // Initialize game points
    playersMonsters = new Array(numPlayers).fill(null).map(() => []); // Initialize empty arrays for each player's monsters
    playersAlive = new Array(numPlayers).fill(true); // All players start alive

    picker = null;
    partner = null;

    updatePlayerStats();

    document.getElementById('biddingPhase').classList.remove('hidden');
    generateBiddingOptions();

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
        let status = playersAlive[i] ? '' : ' (Eliminated)';
        stats += `<div class="player-stats">Player ${i + 1}${status} - Life Points: ${lifePoints[i]}, Summoning Points: ${summoningPoints[i]}</div>`;
    }
    document.getElementById('playerStats').innerHTML = stats;
}

// Show Game Points
function showGamePoints() {
    let content = '<h3>Game Points:</h3>';
    for (let i = 0; i < numPlayers; i++) {
        content += `<p>Player ${i + 1}: ${gamePoints[i]} points</p>`;
    }
    showModal(content);
}

// Show Rules
function showRules() {
    let content = `
        <h3>Basic Rules</h3>
        <p>This is a simplified version of Sheepshead with Yu-Gi-Oh! elements.</p>
        <h4>Card Strength Hierarchy</h4>
        <p><strong>Trump Cards:</strong> ${trumpCards.join(', ')}</p>
        <p><strong>Fail Cards:</strong> Ace, Ten, King, Nine, Eight, Seven of Clubs, Spades, and Hearts.</p>
        <p>The strength of the cards descends from highest to lowest as listed.</p>
    `;
    showModal(content);
}

// Show Modal
function showModal(content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = content;
    modal.classList.remove('hidden');
    const closeModal = document.getElementById('closeModal');
    closeModal.onclick = function() {
        modal.classList.add('hidden');
    };
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.classList.add('hidden');
        }
    };
}

// Bidding Phase
function generateBiddingOptions() {
    const biddingDiv = document.getElementById('biddingOptions');
    biddingDiv.innerHTML = "";
    for (let i = 1; i <= numPlayers; i++) {
        if (!playersAlive[i - 1]) continue; // Skip eliminated players
        biddingDiv.innerHTML += `
            <div class="player-section">
                Player ${i}
                <label for="player${i}-bid">Bid (Enter points to bid or 'pass'):</label>
                <input type="text" id="player${i}-bid" placeholder="pass">
            </div>
        `;
    }
}

function endBiddingPhase() {
    let highestBid = -1;
    let highestBidder = null;
    for (let i = 1; i <= numPlayers; i++) {
        if (!playersAlive[i - 1]) continue;
        const bidInput = document.getElementById(`player${i}-bid`).value.trim().toLowerCase();
        if (bidInput !== 'pass') {
            const bidValue = parseInt(bidInput);
            if (!isNaN(bidValue) && bidValue > highestBid) {
                highestBid = bidValue;
                highestBidder = i - 1;
            }
        }
    }

    if (highestBidder !== null) {
        picker = highestBidder;
        // Picker selects a partner by calling a card
        let calledCard = prompt(`Player ${picker + 1}, call a card to choose your Partner (e.g., "Queen of Hearts"):`);

        // For simplicity, we'll assign the partner randomly among alive players (excluding picker)
        let potentialPartners = [];
        for (let i = 0; i < numPlayers; i++) {
            if (i !== picker && playersAlive[i]) {
                potentialPartners.push(i);
            }
        }
        if (potentialPartners.length > 0) {
            partner = potentialPartners[Math.floor(Math.random() * potentialPartners.length)];
            alert(`Player ${partner + 1} is the Partner!`);
        } else {
            partner = null;
            alert('No Partner available.');
        }
    } else {
        picker = null;
        partner = null;
        alert('No one bid. Proceeding without Picker and Partner.');
    }

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
        if (!playersAlive[i - 1]) continue; // Skip eliminated players
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

function calculateTrickResults() {
    let highestValue = -1;
    trickWinner = -1;

    for (let i = 1; i <= numPlayers; i++) {
        if (!playersAlive[i - 1]) continue;
        const rank = document.getElementById(`player${i}-card-rank`).value;
        const suit = document.getElementById(`player${i}-card-suit`).value;
        const card = rank + suit;
        const strength = cardStrengths[card] || 0;
        if (strength > highestValue) {
            highestValue = strength;
            trickWinner = i;
        }
    }

    if (trickWinner !== -1) {
        const winnerRank = document.getElementById(`player${trickWinner}-card-rank`).value;
        const winnerSuit = document.getElementById(`player${trickWinner}-card-suit`).value;
        document.getElementById('trickResult').innerHTML = `Player ${trickWinner} wins the trick with a ${winnerRank} of ${winnerSuit}!`;
        const pointsEarned = cardPoints[winnerRank] || 0;
        updateSummoningPointsFromTricks(pointsEarned);
    } else {
        document.getElementById('trickResult').innerHTML = `No valid plays.`;
    }
}

function updateSummoningPointsFromTricks(pointsEarned) {
    const points = pointsEarned * 100;

    if (picker !== null && (trickWinner - 1 === picker || trickWinner - 1 === partner)) {
        // Picker and Partner share points
        summoningPoints[picker] += points / 2;
        summoningPoints[partner] += points / 2;
    } else {
        summoningPoints[trickWinner - 1] += points;
    }

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
        if (!playersAlive[i - 1]) continue; // Skip eliminated players
        summoningDiv.innerHTML += `
            <div class="player-section">
                <h3>Player ${i}</h3>
                <button onclick="addSummon(${i})">Add Summon</button>
                <div id="player${i}-summon-container"></div>
                <div class="error-message" id="player${i}-error"></div>
            </div>
        `;
    }
}

function addSummon(playerNum) {
    const summonContainer = document.getElementById(`player${playerNum}-summon-container`);
    const summonIndex = summonContainer.children.length;
    const summonDiv = document.createElement('div');
    summonDiv.classList.add('summon-entry');
    summonDiv.innerHTML = `
        <label>Monster Level:
            <input type="number" id="player${playerNum}-summon${summonIndex}-level" min="1" max="12" value="1">
        </label>
        Summoning Cost: <span id="player${playerNum}-summon${summonIndex}-cost">200</span><br>
        <label>ATK Points:
            <input type="number" id="player${playerNum}-summon${summonIndex}-atk" min="0" value="0">
        </label>
        <label>DEF Points:
            <input type="number" id="player${playerNum}-summon${summonIndex}-def" min="0" value="0">
        </label>
        <button onclick="removeSummon(${playerNum}, ${summonIndex})">Remove</button>
        <hr>
    `;
    summonContainer.appendChild(summonDiv);

    // Update cost when level changes
    const levelInput = document.getElementById(`player${playerNum}-summon${summonIndex}-level`);
    const costSpan = document.getElementById(`player${playerNum}-summon${summonIndex}-cost`);
    levelInput.addEventListener('input', () => {
        const level = parseInt(levelInput.value) || 0;
        const cost = level * 200;
        costSpan.innerText = cost;
    });
}

function removeSummon(playerNum, summonIndex) {
    const summonContainer = document.getElementById(`player${playerNum}-summon-container`);
    const summonDiv = summonContainer.children[summonIndex];
    summonContainer.removeChild(summonDiv);
}

function endSummoningPhase() {
    let allValid = true;

    for (let i = 1; i <= numPlayers; i++) {
        if (!playersAlive[i - 1]) continue; // Skip eliminated players

        const errorDiv = document.getElementById(`player${i}-error`);
        errorDiv.textContent = ''; // Clear previous error messages
        let totalCost = 0;
        const summons = [];
        const summonContainer = document.getElementById(`player${i}-summon-container`);
        const summonEntries = summonContainer.getElementsByClassName('summon-entry');

        for (let j = 0; j < summonEntries.length; j++) {
            const levelInput = document.getElementById(`player${i}-summon${j}-level`);
            const atkInput = document.getElementById(`player${i}-summon${j}-atk`);
            const defInput = document.getElementById(`player${i}-summon${j}-def`);

            const level = parseInt(levelInput.value) || 0;
            const atk = parseInt(atkInput.value) || 0;
            const def = parseInt(defInput.value) || 0;
            const cost = level * 200;
            totalCost += cost;

            summons.push({ level, atk, def, cost });
        }

        let availableSummoningPoints = summoningPoints[i - 1];
        if ((picker === i - 1 || partner === i - 1) && picker !== null && partner !== null) {
            // Share summoning points between Picker and Partner
            availableSummoningPoints = summoningPoints[picker] + summoningPoints[partner];
        }

        if (availableSummoningPoints >= totalCost) {
            // Deduct summoning points
            if ((picker === i - 1 || partner === i - 1) && picker !== null && partner !== null) {
                let remainingCost = totalCost;
                if (summoningPoints[i - 1] >= remainingCost) {
                    summoningPoints[i - 1] -= remainingCost;
                } else {
                    remainingCost -= summoningPoints[i - 1];
                    summoningPoints[i - 1] = 0;
                    let otherPlayer = picker === i - 1 ? partner : picker;
                    summoningPoints[otherPlayer] -= remainingCost;
                }
            } else {
                summoningPoints[i - 1] -= totalCost;
            }
            playersMonsters[i - 1] = summons; // Store all summoned monsters
        } else {
            errorDiv.textContent = `Not enough summoning points! You need ${totalCost}, but have ${availableSummoningPoints}.`;
            allValid = false;
        }
    }

    updatePlayerStats();

    if (allValid) {
        moveToNextPhase('summoningPhase', 'battlePhase');
    } else {
        alert('Please adjust your summoning to be within your available summoning points.');
    }
}

// Battle Phase
function generateBattleInputs() {
    const battleDiv = document.getElementById('battleInputs');
    battleDiv.innerHTML = "";

    for (let i = 1; i <= numPlayers; i++) {
        if (!playersAlive[i - 1]) continue; // Skip eliminated players
        const monsters = playersMonsters[i - 1];
        if (monsters.length > 0) {
            battleDiv.innerHTML += `<h3>Player ${i}</h3>`;
            monsters.forEach((monster, index) => {
                battleDiv.innerHTML += `
                    <div class="player-section">
                        <div>Your Monster ${index + 1}: Level ${monster.level}, ATK ${monster.atk}, DEF ${monster.def}</div>
                        <label for="player${i}-attack${index}-target">Attack Target (Player Number):</label>
                        <input type="number" id="player${i}-attack${index}-target" min="1" max="${numPlayers}" value="${(i % numPlayers) + 1}">
                        <label for="player${i}-attack${index}-position">Attack Position:</label>
                        <select id="player${i}-attack${index}-position">
                            <option value="attack">Attack</option>
                            <option value="defense">Defense</option>
                        </select>
                    </div>
                `;
            });
        } else {
            battleDiv.innerHTML += `
                <div class="player-section">
                    <h3>Player ${i}</h3>
                    <div>You have no monsters to attack with.</div>
                </div>
            `;
        }
    }
}

function endBattlePhase() {
    const battleLog = [];
    for (let i = 1; i <= numPlayers; i++) {
        if (!playersAlive[i - 1]) continue; // Skip eliminated players
        const monsters = playersMonsters[i - 1];
        for (let k = 0; k < monsters.length; k++) {
            const attacker = monsters[k];
            const targetPlayerNum = parseInt(document.getElementById(`player${i}-attack${k}-target`).value);
            if (targetPlayerNum < 1 || targetPlayerNum > numPlayers || targetPlayerNum === i) continue;
            if (!playersAlive[targetPlayerNum - 1]) continue; // Skip if target player is eliminated

            const defenderMonsters = playersMonsters[targetPlayerNum - 1];
            const attackerPosition = document.getElementById(`player${i}-attack${k}-position`).value;

            if (defenderMonsters.length === 0) {
                // Direct attack
                lifePoints[targetPlayerNum - 1] -= attacker.atk;
                battleLog.push(`Player ${i}'s Monster ${k + 1} attacked Player ${targetPlayerNum} directly for ${attacker.atk} damage.`);
            } else {
                // For simplicity, attack the first monster
                const defender = defenderMonsters[0];
                let damage = 0;

                if (attackerPosition === 'attack') {
                    damage = attacker.atk - defender.atk;
                } else {
                    damage = attacker.def - defender.atk;
                }

                if (damage > 0) {
                    // Defender's monster destroyed
                    defenderMonsters.splice(0, 1);
                    lifePoints[targetPlayerNum - 1] -= damage;
                    battleLog.push(`Player ${i}'s Monster ${k + 1} defeated Player ${targetPlayerNum}'s Monster 1. Player ${targetPlayerNum} takes ${damage} damage.`);
                } else if (damage < 0) {
                    // Attacker's monster destroyed
                    monsters.splice(k, 1);
                    lifePoints[i - 1] += damage; // damage is negative
                    battleLog.push(`Player ${i}'s Monster ${k + 1} was destroyed by Player ${targetPlayerNum}'s Monster 1. Player ${i} takes ${-damage} damage.`);
                } else {
                    // Both monsters remain
                    battleLog.push(`Player ${i}'s Monster ${k + 1} and Player ${targetPlayerNum}'s Monster 1 are equally matched. No damage.`);
                }
            }
        }
    }

    document.getElementById('battleResults').innerHTML = battleLog.join('<br>');
    updatePlayerStats();
    checkForEliminations();
    checkForWinner();
    moveToNextPhase('battlePhase', 'endPhase');
}

function checkForEliminations() {
    for (let i = 0; i < numPlayers; i++) {
        if (lifePoints[i] <= 0 && playersAlive[i]) {
            playersAlive[i] = false;
            alert(`Player ${i + 1} has been eliminated!`);
        }
    }
}

function checkForWinner() {
    const alivePlayers = playersAlive.filter(status => status).length;
    if (alivePlayers === 1) {
        const winnerIndex = playersAlive.findIndex(status => status);
        alert(`Player ${winnerIndex + 1} wins the game!`);
        // Update game points
        gamePoints[winnerIndex] += 1;
        // Reset or end game as per game rules
    }
}

function startNextRound() {
    // Reset necessary variables or proceed as per game rules
    playersMonsters = new Array(numPlayers).fill(null).map(() => []);
    moveToNextPhase('endPhase', 'trickTakingPhase');
    generateTrickTakingInputs();
}

function moveToNextPhase(currentPhase, nextPhase) {
    document.getElementById(currentPhase).classList.add('hidden');
    document.getElementById(nextPhase).classList.remove('hidden');

    // Initialize the next phase if needed
    switch (nextPhase) {
        case 'biddingPhase':
            generateBiddingOptions();
            break;
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
