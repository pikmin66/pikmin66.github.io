// Variables for the Game Companion
let numPlayers = 2; // User + AI players
let userPlayerIndex = 0; // Index of the user player
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
let playerDecks = [];
let playerHands = [];
let discardPiles = [];
let cardsData = [];
let trickCount = 0;
let maxTricks = 1; // Set to 1 trick per Trick-Taking Phase

// Variables to store played cards in the Trick-Taking Phase
let playedCardsThisTrick = [];

// Load card data from JSON (load this at the beginning)
fetch('cards.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        cardsData = data;
        init();
    })
    .catch(error => console.error('Error loading card data:', error));

function init() {
    // Attach event listeners to the buttons in the Game Companion
    document.getElementById('startGame').addEventListener('click', initializeGame);
    // Note: 'calculateTrickResults' button will be transformed into 'endTrickTakingPhase'
    document.getElementById('calculateTrickResults').addEventListener('click', calculateTrickResults);
    document.getElementById('nextRound').addEventListener('click', startNextRound);

    // Add event listeners to the toggle buttons
    document.getElementById('toggleToPlayZone').addEventListener('click', toggleToPlayZone);
    document.getElementById('toggleToGameCompanion').addEventListener('click', toggleToGameCompanion);

    // Event listener for the Card Hierarchy button
    document.getElementById('toggleHierarchy').addEventListener('click', () => {
        document.getElementById('hierarchyModal').classList.remove('hidden');
    });

    // Event listener for closing the hierarchy modal
    document.getElementById('closeHierarchyModal').addEventListener('click', () => {
        document.getElementById('hierarchyModal').classList.add('hidden');
    });

    // Initialize the Play Zone
    initPlayZone();
}

// Game Initialization
function initializeGame() {
    numPlayers = parseInt(document.getElementById('numPlayers').value);
    userPlayerIndex = 0; // Assume user is Player 1

    // Set initial summoning points and life points
    summoningPoints = new Array(numPlayers).fill(1000);
    lifePoints = new Array(numPlayers).fill(8000);
    gamePoints = new Array(numPlayers).fill(0);
    playersAlive = new Array(numPlayers).fill(true);

    picker = null;
    partner = null;

    // Initialize players' decks, hands, discard piles, and monsters
    playerDecks = [];
    playerHands = [];
    discardPiles = [];
    playersMonsters = [];

    for (let i = 0; i < numPlayers; i++) {
        // Create and shuffle decks
        let deck = [...cardsData];
        deck = shuffleArray(deck);
        playerDecks.push(deck);

        // Initialize hands
        playerHands[i] = []; // Initialize the player's hand
        let hand = playerHands[i];
        for (let j = 0; j < 5; j++) {
            let card = drawCardFromDeck(i);
            if (card) hand.push(card);
        }

        // Initialize discard piles and monsters
        discardPiles.push([]);
        playersMonsters.push([]);
    }

    // Update Play Zone for the user
    updatePlayZone(userPlayerIndex);

    // Proceed to the Trick-Taking Phase
    moveToNextPhase('gameSetup', 'trickTakingPhase');
    generateTrickTakingInputs();

    document.getElementById('playerStatsOverview').classList.remove('hidden');
}


// Function to draw a card from a player's deck
function drawCardFromDeck(playerIndex) {
    if (playerHands[playerIndex].length >= 5) {
        if (playerIndex === userPlayerIndex) {
            alert('Your hand is full!');
        }
        return null;
    }
    if (playerDecks[playerIndex].length > 0) {
        return playerDecks[playerIndex].shift();
    } else {
        if (playerIndex === userPlayerIndex) {
            alert('No more cards in your deck!');
        }
        return null;
    }
}

// Update the Play Zone display for a specific player
function updatePlayZone(playerIndex = userPlayerIndex) {
    let handCardsContainer = document.getElementById('hand-cards');
    handCardsContainer.innerHTML = '';

    playerHands[playerIndex].forEach(card => {
        let cardElement = createCardElement(card);
        handCardsContainer.appendChild(cardElement);
    });

    // Update AI players' played cards
    updateAIPlayedCards();

    setupDragAndDrop(playerIndex);
}

// Function to update AI players' played cards in the Play Zone
function updateAIPlayedCards() {
    for (let i = 0; i < numPlayers; i++) {
        if (i !== userPlayerIndex) {
            let aiPlayArea = document.getElementById(`ai-player-${i}-cards`);
            aiPlayArea.innerHTML = '';

            // Display the last card played by the AI player
            if (playedCardsThisTrick.length > 0) {
                let aiPlayedCard = playedCardsThisTrick.find(play => play.playerIndex === i);
                if (aiPlayedCard) {
                    let cardElement = createCardElement(aiPlayedCard.card);
                    aiPlayArea.appendChild(cardElement);
                }
            }
        }
    }
}

// Create a card element
function createCardElement(cardData) {
    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.draggable = true;
    cardDiv.id = cardData.id;

    // Store card data in a dataset
    cardDiv.dataset.card = JSON.stringify(cardData);

    let img = document.createElement('img');
    img.src = cardData.image || 'images/placeholder.png';
    img.alt = cardData.name;

    cardDiv.appendChild(img);

    // Add click event listener to toggle card details
    cardDiv.addEventListener('click', toggleCardDetails);

    return cardDiv;
}

// Toggle card details display
function toggleCardDetails(e) {
    let existingDetails = this.querySelector('.card-details');
    if (existingDetails) {
        // Details are already displayed; remove them
        this.removeChild(existingDetails);
    } else {
        // Details are not displayed; show them
        let cardData = JSON.parse(this.dataset.card);

        let detailsDiv = document.createElement('div');
        detailsDiv.classList.add('card-details');
        detailsDiv.innerHTML = `
            <h3>${cardData.name}</h3>
            <p><strong>Suit:</strong> ${cardData.suit || 'N/A'}</p>
            <p><strong>Rank:</strong> ${cardData.rank || 'N/A'}</p>
            <p><strong>Stars:</strong> ${'★'.repeat(cardData.stars || 0)}</p>
            <p><strong>Level:</strong> ${cardData.level || 'N/A'}</p>
            <p><strong>ATK:</strong> ${cardData.atk || 'N/A'}</p>
            <p><strong>DEF:</strong> ${cardData.def || 'N/A'}</p>
            <p><strong>Effect:</strong> ${cardData.effect || 'N/A'}</p>
        `;

        detailsDiv.style.position = 'absolute';
        detailsDiv.style.top = '0';
        detailsDiv.style.left = '110%';
        detailsDiv.style.backgroundColor = '#fff';
        detailsDiv.style.border = '1px solid #ccc';
        detailsDiv.style.padding = '10px';
        detailsDiv.style.zIndex = '10';
        detailsDiv.style.width = '200px';

        this.appendChild(detailsDiv);
    }
}

// Set up drag-and-drop functionality (for single-player Play Zone)
function setupDragAndDrop(playerIndex = userPlayerIndex) {
    let cards = document.querySelectorAll('.card');
    let handCardsContainer = document.getElementById('hand-cards');
    let playAreaContainer = document.getElementById('play-area-cards');

    cards.forEach(card => {
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });

    [handCardsContainer, playAreaContainer].forEach(zone => {
        zone.addEventListener('dragover', dragOver);
        zone.addEventListener('drop', (e) => drop(e, playerIndex));
    });
}

function dragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.id);
}

function dragEnd() {
    this.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e, playerIndex) {
    e.preventDefault();
    let cardId = e.dataTransfer.getData('text/plain');
    let card = document.getElementById(cardId);

    if (this.id === 'play-area-cards') {
        // Move card from hand to play area
        playCard(cardId, playerIndex);
    } else if (this.id === 'hand-cards') {
        // Move card back to hand
        returnCardToHand(cardId, playerIndex);
    }
}

// Play a card from a player's hand
function playCard(cardId, playerIndex) {
    let playerHand = playerHands[playerIndex];
    let cardIndex = playerHand.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
        let playedCard = playerHand.splice(cardIndex, 1)[0];
        discardPiles[playerIndex].push(playedCard);
        updatePlayZone(playerIndex);

        // If it's the user, display the played card
        if (playerIndex === userPlayerIndex) {
            let playArea = document.getElementById('play-area-cards');
            playArea.innerHTML = ''; // Clear previous cards
            playArea.appendChild(createCardElement(playedCard));
        }
    }
}

// Return a card to a player's hand
function returnCardToHand(cardId, playerIndex) {
    let discardPile = discardPiles[playerIndex];
    let cardIndex = discardPile.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
        let returnedCard = discardPile.splice(cardIndex, 1)[0];
        playerHands[playerIndex].push(returnedCard);
        updatePlayZone(playerIndex);
    }
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

// Trick Taking Phase
function generateTrickTakingInputs() {
    const trickTakingDiv = document.getElementById('trickTakingInputs');
    trickTakingDiv.innerHTML = `<h3>Trick ${trickCount + 1}</h3>`;

    // Draw one card at the start of the Trick-Taking Phase if hand size is less than 5
    if (trickCount === 0 && currentPhase !== 'trickTakingPhaseStarted') {
        currentPhase = 'trickTakingPhaseStarted';
        for (let i = 0; i < numPlayers; i++) {
            if (playerHands[i].length < 5) {
                let card = drawCardFromDeck(i);
                if (card) playerHands[i].push(card);
            }
        }
    }

    // User input
    trickTakingDiv.innerHTML += `
        <div class="player-section">
            <h3>Your Turn</h3>
            <label for="player${userPlayerIndex}-card-select">Select a card to play:</label>
            <select id="player${userPlayerIndex}-card-select">
                ${playerHands[userPlayerIndex].map(card => `<option value="${card.id}">${card.name}</option>`).join('')}
            </select>
        </div>
    `;

    // Enable the calculate button
    document.getElementById('calculateTrickResults').disabled = false;

    // Clear previous played cards
    playedCardsThisTrick = [];

    updatePlayZone(userPlayerIndex);
}

function calculateTrickResults() {
    let playedCards = [];

    // User's selected card
    const selectedCardId = document.getElementById(`player${userPlayerIndex}-card-select`).value;
    const userHand = playerHands[userPlayerIndex];
    const cardIndex = userHand.findIndex(card => card.id === selectedCardId);

    if (cardIndex !== -1) {
        const selectedCard = userHand.splice(cardIndex, 1)[0];
        playedCards.push({ playerIndex: userPlayerIndex, card: selectedCard });
        discardPiles[userPlayerIndex].push(selectedCard);

        // Display the user's played card
        let playArea = document.getElementById('play-area-cards');
        playArea.innerHTML = ''; // Clear previous cards
        playArea.appendChild(createCardElement(selectedCard));
    } else {
        document.getElementById('trickResult').innerHTML = 'Invalid card selection.';
        return;
    }

    // AI players' moves
    for (let i = 0; i < numPlayers; i++) {
        if (i !== userPlayerIndex) {
            let aiHand = playerHands[i];
            if (aiHand.length > 0) {
                // Simple AI logic: play the first card
                const aiCard = aiHand.shift();
                playedCards.push({ playerIndex: i, card: aiCard });
                discardPiles[i].push(aiCard);
            }
        }
    }

    // Store the played cards for display
    playedCardsThisTrick = playedCards;

    // Update the Play Zone to show AI opponents' played cards
    updatePlayZone(userPlayerIndex);

    // Determine the winner
    let winningPlayerIndex = determineTrickWinner(playedCards);

    // Calculate points
    let totalPoints = playedCards.reduce((sum, play) => sum + (play.card.stars || 0), 0);

    // Add summoning points
    summoningPoints[winningPlayerIndex] += totalPoints * 100;

    // Display results
    let resultMessage = `Player ${winningPlayerIndex + 1} wins the trick and earns ${totalPoints} points (${totalPoints * 100} summoning points)!<br>`;
    resultMessage += `Cards played:<br>`;
    playedCards.forEach(play => {
        resultMessage += `Player ${play.playerIndex + 1}: ${play.card.name}<br>`;
    });
    document.getElementById('trickResult').innerHTML = resultMessage;

    updatePlayerStats();

    trickCount++;

    // Disable the calculate button
    let calculateButton = document.getElementById('calculateTrickResults');
    calculateButton.disabled = false; // Enable the button for the next action

    // Change the button's text to 'End Trick Taking Phase'
    calculateButton.textContent = 'End Trick Taking Phase';

    // Update the event listener
    calculateButton.removeEventListener('click', calculateTrickResults);
    calculateButton.addEventListener('click', endTrickTakingPhase);
}

// Function to determine the winner of the trick
function determineTrickWinner(playedCards) {
    // Simplified logic: highest level card wins
    let winningPlayerIndex = playedCards[0].playerIndex;
    let highestLevel = playedCards[0].card.level || 0;

    for (let i = 1; i < playedCards.length; i++) {
        let currentLevel = playedCards[i].card.level || 0;
        if (currentLevel > highestLevel) {
            highestLevel = currentLevel;
            winningPlayerIndex = playedCards[i].playerIndex;
        }
    }

    return winningPlayerIndex;
}

function endTrickTakingPhase() {
    trickCount = 0; // Reset for next round
    currentPhase = ''; // Reset currentPhase flag

    // Clear AI played cards
    for (let i = 0; i < numPlayers; i++) {
        if (i !== userPlayerIndex) {
            let aiPlayArea = document.getElementById(`ai-player-${i}-cards`);
            aiPlayArea.innerHTML = '';
        }
    }

    // Clear user's played cards
    let playArea = document.getElementById('play-area-cards');
    playArea.innerHTML = '';

    // Display total summoning points for each player
    let summary = '<h3>Trick-Taking Phase Summary:</h3>';
    for (let i = 0; i < numPlayers; i++) {
        summary += `<p>Player ${i + 1} has ${summoningPoints[i]} summoning points.</p>`;
    }
    document.getElementById('trickResult').innerHTML = summary;


    // Reset the 'Calculate Trick Results' button for the next trick-taking phase
    let calculateButton = document.getElementById('calculateTrickResults');
    calculateButton.textContent = 'Calculate Trick Results';
    calculateButton.removeEventListener('click', endTrickTakingPhase);
    calculateButton.addEventListener('click', calculateTrickResults);
    calculateButton.disabled = false; // Re-enable the button

    moveToNextPhase('trickTakingPhase', 'summoningPhase');
}

function moveToNextPhase(currentPhaseId, nextPhaseId) {
    document.getElementById(currentPhaseId).classList.add('hidden');
    document.getElementById(nextPhaseId).classList.remove('hidden');

    // Initialize the next phase if needed
    switch (nextPhaseId) {
        case 'biddingPhase':
            // generateBiddingOptions();
            break;
        case 'trickTakingPhase':
            generateTrickTakingInputs();
            break;
        case 'summoningPhase':
            generateSummoningInputs();
            break;
        case 'battlePhase':
            generateBattleInputs();
            break;
        default:
            break;
    }
}

// Summoning Phase
function generateSummoningInputs() {
    const summoningDiv = document.getElementById('summoningInputs');
    summoningDiv.innerHTML = "";

    // User's summoning inputs
    summoningDiv.innerHTML += `
        <div class="player-section">
            <h3>Your Summoning Phase</h3>
            <button id="addSummonButton">Add Summon</button>
            <div id="player-summon-container"></div>
            <div class="error-message" id="player-error"></div>
            <button id="endSummoningPhase">End Summoning Phase</button>
        </div>
    `;

    // Add event listener for the Add Summon button
    document.getElementById('addSummonButton').addEventListener('click', addSummon);

    // Add event listener for the End Summoning Phase button
    document.getElementById('endSummoningPhase').addEventListener('click', endSummoningPhase);

    // Simulate AI summoning
    simulateAISummoning();

    updatePlayZone(userPlayerIndex);
}

function simulateAISummoning() {
    for (let i = 0; i < numPlayers; i++) {
        if (i !== userPlayerIndex) {
            let aiHand = playerHands[i];
            let aiSummoningPoints = summoningPoints[i];

            // Simple AI logic: summon monsters until points run out
            while (aiSummoningPoints > 0 && aiHand.length > 0) {
                let card = aiHand[0]; // Take the first card
                let cost = (card.level || 0) * 200;
                if (cost <= aiSummoningPoints) {
                    aiHand.shift(); // Remove card from hand
                    playersMonsters[i].push(card);
                    aiSummoningPoints -= cost;
                    summoningPoints[i] -= cost;
                } else {
                    break;
                }
            }
        }
    }
}

function addSummon() {
    const summonContainer = document.getElementById(`player-summon-container`);
    const summonIndex = summonContainer.children.length;
    const summonDiv = document.createElement('div');
    summonDiv.classList.add('summon-entry');
    summonDiv.innerHTML = `
        <label>Select Card to Summon:
            <select id="summon${summonIndex}-card-select">
                ${playerHands[userPlayerIndex].map(card => `<option value="${card.id}">${card.name}</option>`).join('')}
            </select>
        </label>
        Summoning Cost: <span id="summon${summonIndex}-cost">0</span><br>
        <button onclick="removeSummon(${summonIndex})">Remove</button>
        <hr>
    `;
    summonContainer.appendChild(summonDiv);

    const cardSelect = document.getElementById(`summon${summonIndex}-card-select`);
    const costSpan = document.getElementById(`summon${summonIndex}-cost`);
    cardSelect.addEventListener('change', () => {
        const selectedCard = playerHands[userPlayerIndex].find(card => card.id === cardSelect.value);
        const cost = (selectedCard.level || 0) * 200;
        costSpan.innerText = cost;
    });

    // Trigger change event to set initial cost
    cardSelect.dispatchEvent(new Event('change'));
}

function removeSummon(summonIndex) {
    const summonContainer = document.getElementById(`player-summon-container`);
    const summonDiv = summonContainer.children[summonIndex];
    summonContainer.removeChild(summonDiv);
}

function endSummoningPhase() {
    const errorDiv = document.getElementById(`player-error`);
    errorDiv.textContent = ''; // Clear previous error messages
    let totalCost = 0;
    const summons = [];
    const summonContainer = document.getElementById(`player-summon-container`);
    const summonEntries = summonContainer.getElementsByClassName('summon-entry');

    for (let j = 0; j < summonEntries.length; j++) {
        const cardSelect = summonEntries[j].querySelector(`select`);
        const selectedCard = playerHands[userPlayerIndex].find(card => card.id === cardSelect.value);
        const cost = (selectedCard.level || 0) * 200;
        totalCost += cost;

        summons.push(selectedCard);
    }

    let availableSummoningPoints = summoningPoints[userPlayerIndex];

    if (availableSummoningPoints >= totalCost) {
        // Deduct summoning points
        summoningPoints[userPlayerIndex] -= totalCost;

        // Remove summoned cards from hand and add to player's monsters
        summons.forEach(card => {
            let cardIndex = playerHands[userPlayerIndex].findIndex(c => c.id === card.id);
            if (cardIndex !== -1) {
                playerHands[userPlayerIndex].splice(cardIndex, 1);
                playersMonsters[userPlayerIndex].push(card);
            }
        });

        updatePlayerStats();
        moveToNextPhase('summoningPhase', 'battlePhase');
    } else {
        errorDiv.textContent = `Not enough summoning points! You need ${totalCost}, but have ${availableSummoningPoints}.`;
        alert('Please adjust your summoning to be within your available summoning points.');
    }
}

// Battle Phase
function generateBattleInputs() {
    const battleDiv = document.getElementById('battleInputs');
    battleDiv.innerHTML = "";

    // User's monsters
    const userMonsters = playersMonsters[userPlayerIndex];
    if (userMonsters.length > 0) {
        battleDiv.innerHTML += `<h3>Your Monsters</h3>`;
        userMonsters.forEach((monster, index) => {
            // Build attack target options
            let targetOptions = '';
            for (let i = 0; i < numPlayers; i++) {
                if (i !== userPlayerIndex) {
                    targetOptions += `<option value="Player ${i + 1}">Player ${i + 1}</option>`;
                    playersMonsters[i].forEach(opponentMonster => {
                        targetOptions += `<option value="${opponentMonster.id}">${opponentMonster.name} (Player ${i + 1}'s Monster)</option>`;
                    });
                }
            }

            battleDiv.innerHTML += `
                <div class="player-section">
                    <div>Monster ${index + 1}: ${monster.name}, Level ${monster.level}, ATK ${monster.atk}, DEF ${monster.def}</div>
                    <label for="attack${index}-target">Attack Target:</label>
                    <select id="attack${index}-target">${targetOptions}</select>
                </div>
            `;
        });
    } else {
        battleDiv.innerHTML += `
            <div class="player-section">
                <div>You have no monsters to attack with.</div>
            </div>
        `;
    }

    // Simulate AI battle actions
    simulateAIBattle();

    // Add button to end Battle Phase
    battleDiv.innerHTML += `<button id="endBattlePhase">End Battle Phase</button>`;

    // Add event listener
    document.getElementById('endBattlePhase').addEventListener('click', endBattlePhase);
}

function simulateAIBattle() {
    // Simple AI logic: attack the user if they have monsters
    for (let i = 0; i < numPlayers; i++) {
        if (i !== userPlayerIndex) {
            let aiMonsters = playersMonsters[i];
            if (aiMonsters.length > 0) {
                // AI attacks user's monsters
                aiMonsters.forEach(monster => {
                    // For simplicity, AI attacks the first user's monster
                    if (playersMonsters[userPlayerIndex].length > 0) {
                        // Resolve battle (simplified)
                        let userMonster = playersMonsters[userPlayerIndex][0];
                        if (monster.atk > userMonster.def) {
                            // User's monster is destroyed
                            playersMonsters[userPlayerIndex].shift();
                            alert(`AI Player ${i + 1}'s ${monster.name} destroyed your ${userMonster.name}!`);
                        } else if (monster.atk < userMonster.def) {
                            // AI's monster is destroyed
                            aiMonsters.shift();
                            alert(`Your ${userMonster.name} destroyed AI Player ${i + 1}'s ${monster.name}!`);

                            // Gain summoning points equal to the cost of the defeated monster
                            let defeatedMonsterCost = (monster.level || 0) * 200;
                            summoningPoints[userPlayerIndex] += defeatedMonsterCost;
                            alert(`You gained ${defeatedMonsterCost} summoning points!`);
                        } else {
                            // Both are destroyed
                            playersMonsters[userPlayerIndex].shift();
                            aiMonsters.shift();
                            alert(`Both your ${userMonster.name} and AI Player ${i + 1}'s ${monster.name} were destroyed!`);
                        }
                    } else {
                        // User has no monsters; AI attacks directly
                        lifePoints[userPlayerIndex] -= monster.atk;
                        alert(`AI Player ${i + 1}'s ${monster.name} attacked you directly for ${monster.atk} damage!`);
                    }
                });
            }
        }
    }
}

function processPlayerBattleActions() {
    const userMonsters = playersMonsters[userPlayerIndex];
    for (let i = 0; i < userMonsters.length; i++) {
        const attackTarget = document.getElementById(`attack${i}-target`).value;
        const userMonster = userMonsters[i];

        if (attackTarget.startsWith('Player ')) {
            // Attack player directly
            let targetPlayerIndex = parseInt(attackTarget.split(' ')[1]) - 1;
            lifePoints[targetPlayerIndex] -= userMonster.atk;
            alert(`Your ${userMonster.name} attacked Player ${targetPlayerIndex + 1} directly for ${userMonster.atk} damage!`);
        } else {
            // Attack opponent's monster
            let targetMonster = null;
            let targetPlayerIndex = -1;

            // Find the target monster
            for (let j = 0; j < numPlayers; j++) {
                if (j !== userPlayerIndex) {
                    let monster = playersMonsters[j].find(m => m.id === attackTarget);
                    if (monster) {
                        targetMonster = monster;
                        targetPlayerIndex = j;
                        break;
                    }
                }
            }

            if (targetMonster && targetPlayerIndex !== -1) {
                if (userMonster.atk > targetMonster.def) {
                    // Target's monster is destroyed
                    playersMonsters[targetPlayerIndex] = playersMonsters[targetPlayerIndex].filter(m => m.id !== targetMonster.id);
                    alert(`Your ${userMonster.name} destroyed Player ${targetPlayerIndex + 1}'s ${targetMonster.name}!`);

                    // Gain summoning points equal to the cost of the defeated monster
                    let defeatedMonsterCost = (targetMonster.level || 0) * 200;
                    summoningPoints[userPlayerIndex] += defeatedMonsterCost;
                    alert(`You gained ${defeatedMonsterCost} summoning points!`);
                } else if (userMonster.atk < targetMonster.def) {
                    // Your monster is destroyed
                    userMonsters.splice(i, 1);
                    alert(`Player ${targetPlayerIndex + 1}'s ${targetMonster.name} destroyed your ${userMonster.name}!`);
                } else {
                    // Both are destroyed
                    playersMonsters[targetPlayerIndex] = playersMonsters[targetPlayerIndex].filter(m => m.id !== targetMonster.id);
                    userMonsters.splice(i, 1);
                    alert(`Both your ${userMonster.name} and Player ${targetPlayerIndex + 1}'s ${targetMonster.name} were destroyed!`);
                }
            }
        }
    }
}

function endBattlePhase() {
    // Process player's battle actions
    processPlayerBattleActions();

    // Battle actions have been resolved
    document.getElementById('battleResults').innerHTML = 'Battle Phase ended. Proceeding to End Phase.';

    updatePlayerStats();
    moveToNextPhase('battlePhase', 'endPhase');
}

function startNextRound() {
    // Reset necessary variables or proceed as per game rules
    playersMonsters = new Array(numPlayers).fill(null).map(() => []);
    currentPhase = ''; // Reset currentPhase flag

    moveToNextPhase('endPhase', 'trickTakingPhase');
    generateTrickTakingInputs();
}

function changeGameVariant() {
    gameVariant = document.getElementById('gameVariant').value;
}

// Shuffle an array
function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle
    while (currentIndex !== 0) {

        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap it with the current element
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

function initPlayZone() {
    // Play Zone will be updated when the game starts
}

function toggleToPlayZone() {
    document.getElementById('gameCompanion').classList.add('hidden');
    document.getElementById('playZone').classList.remove('hidden');
}

function toggleToGameCompanion() {
    document.getElementById('playZone').classList.add('hidden');
    document.getElementById('gameCompanion').classList.remove('hidden');
}
