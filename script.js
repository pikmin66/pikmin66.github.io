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
let playerDecks = [];
let playerHands = [];
let discardPile = [];
let cardsData = [];
let trickCount = 0;
let maxTricks = 3; // Number of tricks to play in the Trick-Taking Phase


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
    document.getElementById('calculateTrickResults').addEventListener('click', calculateTrickResults);
    document.getElementById('endTrickTakingPhase').addEventListener('click', endTrickTakingPhase);
    document.getElementById('endSummoningPhase').addEventListener('click', endSummoningPhase);
    document.getElementById('endBattlePhase').addEventListener('click', endBattlePhase);
    document.getElementById('nextRound').addEventListener('click', startNextRound);

    // Event listener for the bidding phase
    document.getElementById('endBiddingPhase').addEventListener('click', endBiddingPhase);

    // Add event listener to the toggle button
    document.getElementById('toggleView').addEventListener('click', toggleView);

    // Initialize the Play Zone
    initPlayZone();
}

function initializeGame() {
    numPlayers = parseInt(document.getElementById('numPlayers').value);
    gameVariant = document.getElementById('gameVariant').value;

    // Set initial summoning points
    summoningPoints = new Array(numPlayers).fill(1000);

    lifePoints = new Array(numPlayers).fill(8000);
    gamePoints = new Array(numPlayers).fill(0);
    playersMonsters = new Array(numPlayers).fill(null).map(() => []);
    playersAlive = new Array(numPlayers).fill(true);

    picker = null;
    partner = null;

    // Initialize player's decks and hands
    initializePlayerDecks();

    updatePlayerStats();

    if (numPlayers === 2) {
        // Skip Bidding Phase in two-player game
        alert('Two-player game detected. Skipping Bidding Phase.');
        moveToNextPhase('gameSetup', 'trickTakingPhase');
        generateTrickTakingInputs();
    } else {
        document.getElementById('biddingPhase').classList.remove('hidden');
        generateBiddingOptions();
        document.getElementById('gameSetup').classList.add('hidden');
    }

    document.getElementById('playerStatsOverview').classList.remove('hidden');
}

function initializePlayerDecks() {
    playerDecks = [];
    playerHands = [];

    for (let i = 0; i < numPlayers; i++) {
        // Create a deck for each player
        let deck = [...cardsData];
        deck = shuffleArray(deck);
        playerDecks.push(deck);

        // Initialize each player's hand with 5 cards
        let hand = [];
        for (let j = 0; j < 5; j++) {
            let card = drawCardFromDeck(i);
            if (card) hand.push(card);
        }
        playerHands.push(hand);
    }

    // Update the Play Zone for Player 1
    updatePlayZone(0);
}

function drawCardFromDeck(playerIndex) {
    if (playerDecks[playerIndex].length > 0) {
        return playerDecks[playerIndex].shift();
    } else {
        alert(`No more cards in Player ${playerIndex + 1}'s deck!`);
        return null;
    }
}


// Update the Play Zone display
function updatePlayZone(playerIndex = 0) {
    let handCardsContainer = document.getElementById('hand-cards');
    handCardsContainer.innerHTML = '';

    playerHands[playerIndex].forEach(card => {
        let cardElement = createCardElement(card);
        handCardsContainer.appendChild(cardElement);
    });

    setupDragAndDrop();
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

// Function to initialize the Play Zone
function initPlayZone() {
    // Play Zone will be updated when the game starts
}

function toggleView() {
    const gameCompanion = document.getElementById('gameCompanion');
    const playZone = document.getElementById('playZone');
    const toggleButton = document.getElementById('toggleView');

    if (gameCompanion.classList.contains('hidden')) {
        gameCompanion.classList.remove('hidden');
        playZone.classList.add('hidden');
        toggleButton.textContent = 'Switch to Play Zone';
    } else {
        gameCompanion.classList.add('hidden');
        playZone.classList.remove('hidden');
        toggleButton.textContent = 'Switch to Game Companion';
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

// Set up drag-and-drop functionality
function setupDragAndDrop() {
    let cards = document.querySelectorAll('.card');
    let handCardsContainer = document.getElementById('hand-cards');
    let playAreaContainer = document.getElementById('play-area-cards');

    cards.forEach(card => {
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });

    [handCardsContainer, playAreaContainer].forEach(zone => {
        zone.addEventListener('dragover', dragOver);
        zone.addEventListener('drop', drop);
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

function drop(e) {
    e.preventDefault();
    let cardId = e.dataTransfer.getData('text/plain');
    let card = document.getElementById(cardId);

    if (this.id === 'play-area-cards') {
        // Move card from hand to play area
        playCard(cardId);
    } else if (this.id === 'hand-cards') {
        // Move card back to hand
        returnCardToHand(cardId);
    }
}

// Play a card from hand
function playCard(cardId) {
    let cardIndex = playerHand.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
        let playedCard = playerHand.splice(cardIndex, 1)[0];
        discardPile.push(playedCard);
        updatePlayZone();
        document.getElementById('play-area-cards').appendChild(createCardElement(playedCard));
    }
}

// Return a card to hand
function returnCardToHand(cardId) {
    let cardIndex = discardPile.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
        let returnedCard = discardPile.splice(cardIndex, 1)[0];
        playerHand.push(returnedCard);
        updatePlayZone();
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
    // For brevity, include a simple message
    let content = '<h3>Rules:</h3><p>Refer to the rulebook for detailed instructions.</p>';
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

    // For each player, generate bidding options
    for (let i = 0; i < numPlayers; i++) {
        biddingDiv.innerHTML += `
            <div class="player-section">
                <h3>Player ${i + 1}</h3>
                Do you want to pick up the Blind?
                <select id="player${i}-bid">
                    <option value="pass">Pass</option>
                    <option value="pick">Pick Up Blind</option>
                </select>
            </div>
        `;
    }
}

function endBiddingPhase() {
    let pickerFound = false;
    // Loop through players to determine if someone picked up the Blind
    for (let i = 0; i < numPlayers; i++) {
        const bidChoice = document.getElementById(`player${i}-bid`).value;
        if (bidChoice === 'pick') {
            picker = i; // Set the picker to the player who picked up the Blind
            pickerFound = true;
            alert(`Player ${i + 1} picked up the Blind.`);
            // For simplicity, we'll assume the Blind is empty
            break; // Exit the loop after finding the picker
        }
    }

    if (!pickerFound) {
        picker = null;
        alert('No one picked up the Blind.');
    }

    moveToNextPhase('biddingPhase', 'trickTakingPhase');
}

// Trick Taking Phase
function generateTrickTakingInputs() {
    const trickTakingDiv = document.getElementById('trickTakingInputs');
    trickTakingDiv.innerHTML = `<h3>Trick ${trickCount + 1}</h3>`;

    // Draw two cards for each player at the start of the Trick-Taking Phase
    if (trickCount === 0) {
        for (let i = 0; i < numPlayers; i++) {
            let card1 = drawCardFromDeck(i);
            let card2 = drawCardFromDeck(i);
            if (card1) playerHands[i].push(card1);
            if (card2) playerHands[i].push(card2);
        }
    }

    for (let i = 0; i < numPlayers; i++) {
        trickTakingDiv.innerHTML += `
            <div class="player-section">
                <h3>Player ${i + 1}</h3>
                Select a card to play:
                <select id="player${i}-card-select">
                    ${playerHands[i].map(card => `<option value="${card.id}">${card.name}</option>`).join('')}
                </select>
            </div>
        `;
    }

    // Enable the calculate button and disable the end phase button
    document.getElementById('calculateTrickResults').disabled = false;
    document.getElementById('endTrickTakingPhase').disabled = true;
}


function calculateTrickResults() {
    let playedCards = [];
    for (let i = 0; i < numPlayers; i++) {
        const selectedCardId = document.getElementById(`player${i}-card-select`).value;
        const playerHand = playerHands[i];
        const cardIndex = playerHand.findIndex(card => card.id === selectedCardId);

        if (cardIndex !== -1) {
            const selectedCard = playerHand.splice(cardIndex, 1)[0];
            playedCards.push({ playerIndex: i, card: selectedCard });
            // Optionally, add the card to a discard pile
        } else {
            document.getElementById('trickResult').innerHTML = `Player ${i + 1} did not select a valid card.`;
            return;
        }
    }

    // Determine the winner of the trick
    let winningPlayerIndex = determineTrickWinner(playedCards);

    // Calculate points earned
    let totalPoints = playedCards.reduce((sum, play) => sum + (play.card.stars || 0), 0);

    // Add summoning points to the winning player
    summoningPoints[winningPlayerIndex] += totalPoints * 100;

    document.getElementById('trickResult').innerHTML = `Player ${winningPlayerIndex + 1} wins the trick and earns ${totalPoints} points (${totalPoints * 100} summoning points)!`;

    updatePlayerStats();

    trickCount++;
    if (trickCount >= maxTricks) {
        document.getElementById('calculateTrickResults').disabled = true;
        document.getElementById('endTrickTakingPhase').disabled = false;
    } else {
        // Generate inputs for the next trick
        generateTrickTakingInputs();
    }
}


// Function to determine the winner of the trick
function determineTrickWinner(playedCards) {
    // For simplicity, sum the levels of both cards per player
    let winningPlayerIndex = playedCards[0].playerIndex;
    let highestTotalLevel = playedCards[0].cards.reduce((sum, card) => sum + (card.level || 0), 0);

    for (let i = 1; i < playedCards.length; i++) {
        const currentTotalLevel = playedCards[i].cards.reduce((sum, card) => sum + (card.level || 0), 0);

        if (currentTotalLevel > highestTotalLevel) {
            highestTotalLevel = currentTotalLevel;
            winningPlayerIndex = playedCards[i].playerIndex;
        }
    }

    return winningPlayerIndex;
}

function endTrickTakingPhase() {
    trickCount = 0; // Reset for next round

    // Display total summoning points for each player
    let summary = '<h3>Trick-Taking Phase Summary:</h3>';
    for (let i = 0; i < numPlayers; i++) {
        summary += `<p>Player ${i + 1} has ${summoningPoints[i]} summoning points.</p>`;
    }
    document.getElementById('trickResult').innerHTML = summary;

    moveToNextPhase('trickTakingPhase', 'summoningPhase');
    generateSummoningInputs();
}

// Summoning Phase
function generateSummoningInputs() {
    const summoningDiv = document.getElementById('summoningInputs');
    summoningDiv.innerHTML = "";

    summoningDiv.innerHTML += `
        <div class="player-section">
            <h3>Your Summoning Phase</h3>
            <button onclick="addSummon()">Add Summon</button>
            <div id="player-summon-container"></div>
            <div class="error-message" id="player-error"></div>
        </div>
    `;
}

function addSummon() {
    const summonContainer = document.getElementById(`player-summon-container`);
    const summonIndex = summonContainer.children.length;
    const summonDiv = document.createElement('div');
    summonDiv.classList.add('summon-entry');
    summonDiv.innerHTML = `
        <label>Select Card to Summon:
            <select id="summon${summonIndex}-card-select">
                ${playerHand.map(card => `<option value="${card.id}">${card.name}</option>`).join('')}
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
        const selectedCard = playerHand.find(card => card.id === cardSelect.value);
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
        const cardSelect = document.getElementById(`summon${j}-card-select`);
        const selectedCard = playerHand.find(card => card.id === cardSelect.value);
        const cost = (selectedCard.level || 0) * 200;
        totalCost += cost;

        summons.push(selectedCard);
    }

    let availableSummoningPoints = summoningPoints[0]; // Assuming single-player

    if (availableSummoningPoints >= totalCost) {
        // Deduct summoning points
        summoningPoints[0] -= totalCost;

        // Remove summoned cards from hand and add to player's monsters
        summons.forEach(card => {
            playCard(card.id);
            playersMonsters[0].push(card);
        });

        updatePlayerStats();
        moveToNextPhase('summoningPhase', 'battlePhase');
        generateBattleInputs();
    } else {
        errorDiv.textContent = `Not enough summoning points! You need ${totalCost}, but have ${availableSummoningPoints}.`;
        alert('Please adjust your summoning to be within your available summoning points.');
    }
}

// Battle Phase
function generateBattleInputs() {
    const battleDiv = document.getElementById('battleInputs');
    battleDiv.innerHTML = "";

    const monsters = playersMonsters[0];
    if (monsters.length > 0) {
        battleDiv.innerHTML += `<h3>Your Monsters</h3>`;
        monsters.forEach((monster, index) => {
            battleDiv.innerHTML += `
                <div class="player-section">
                    <div>Monster ${index + 1}: ${monster.name}, Level ${monster.level}, ATK ${monster.atk}, DEF ${monster.def}</div>
                    <label for="attack${index}-target">Attack Target:</label>
                    <input type="text" id="attack${index}-target" placeholder="Opponent or Monster">
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
}

function endBattlePhase() {
    // For simplicity, we'll just display a message
    document.getElementById('battleResults').innerHTML = 'Battle Phase ended. Proceeding to End Phase.';

    updatePlayerStats();
    moveToNextPhase('battlePhase', 'endPhase');
}

function startNextRound() {
    // Reset necessary variables or proceed as per game rules
    playersMonsters = new Array(numPlayers).fill(null).map(() => []);

    if (numPlayers === 2) {
        moveToNextPhase('endPhase', 'trickTakingPhase');
        generateTrickTakingInputs();
    } else {
        moveToNextPhase('endPhase', 'biddingPhase');
        generateBiddingOptions();
    }
}

function moveToNextPhase(currentPhase, nextPhase) {
    document.getElementById(currentPhase).classList.add('hidden');
    document.getElementById(nextPhase).classList.remove('hidden');

    // Initialize the next phase if needed
    switch (nextPhase) {
        case 'biddingPhase':
            if (numPlayers === 2) {
                // Skip Bidding Phase in two-player game
                alert('Skipping Bidding Phase in two-player game.');
                moveToNextPhase('biddingPhase', 'trickTakingPhase');
            } else {
                generateBiddingOptions();
            }
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

function changeGameVariant() {
    gameVariant = document.getElementById('gameVariant').value;
}
