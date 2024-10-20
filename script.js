// Global Variables
let deck = [];
let playerDeck = [];
let opponentDeck = [];
let playerHand = [];
let opponentHand = [];
let playerTricks = [];
let opponentTricks = [];
let playerGraveyard = [];
let opponentGraveyard = [];
let playerSP = 50;
let opponentSP = 50;
let playerLP = 8000;
let opponentLP = 8000;
let currentPhase = 'Not Started';
let turnPlayer = 'Player'; // 'Player' or 'Opponent'
let trumpSuit = 'Diamonds'; // As per Sheepshead rules
let stakesMultiplier = 1;

let playerField = []; // Array of Batteries (Active and Inactive cards)
let opponentField = [];

let playerNegateAttack = false;
let opponentNegateAttack = false;
let playerNegateSpellTrap = false;
let opponentNegateSpellTrap = false;

let tempEffects = {
    player: [],
    opponent: []
};

let opponentPlayedCard = null;
let selectedAttackerIndex = null;
let draggedCardIndex = null;

let actionsThisPhase = 0;

// AI Character
let opponentCharacter = {
    name: 'AI Opponent',
    avatar: 'images/ai_avatar.png',
    personality: 'competitive',
    dialogues: {
        greetings: ['Let\'s have a good game!', 'Prepare to be defeated!'],
        winTrick: ['I won this trick!', 'Better luck next time!'],
        loseTrick: ['You got me this time.', 'Not bad!'],
        summon: ['Behold my creature!', 'Let\'s see how you handle this!'],
        attack: ['Attack!', 'Feel my wrath!'],
        defeat: ['I can\'t believe I lost...', 'You were a worthy opponent.']
    }
};

// UI Elements
let playerLPDisplay;
let opponentLPDisplay;
let playerSPDisplay;
let opponentSPDisplay;

let currentPhaseDisplay;
let turnPlayerDisplay;

let endPhaseButton;

let chatMessagesDiv;

// Load cards from cards.json
document.addEventListener('DOMContentLoaded', () => {
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            deck = data;
            // Initialize game after generating battery slots
            generateBatterySlots();
            initializeGame();
        })
        .catch(error => {
            console.error('Error fetching cards.json:', error);
        });
});

// Generate Battery Slots
function generateBatterySlots() {
    const batteryGrid = document.getElementById('battery-grid');
    for (let i = 1; i <= 16; i++) {
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('battery-slot');
        slotDiv.id = `battery-slot-${i}`;
        batteryGrid.appendChild(slotDiv);
    }
}

// Initialize Game
function initializeGame() {
    console.log('initializeGame() called.');

    // Assign UI elements
    playerLPDisplay = document.getElementById('player-lp');
    opponentLPDisplay = document.getElementById('opponent-lp');
    playerSPDisplay = document.getElementById('player-sp');
    opponentSPDisplay = document.getElementById('opponent-sp');

    currentPhaseDisplay = document.getElementById('current-phase');
    turnPlayerDisplay = document.getElementById('turn-player');

    endPhaseButton = document.getElementById('end-phase');

    chatMessagesDiv = document.getElementById('chat-messages');

    // Add event listeners
    const startGameButton = document.getElementById('start-game');
    if (startGameButton) {
        console.log('Attaching event listener to Start Game button.');
        startGameButton.addEventListener('click', startGame);
        startGameButton.disabled = false; // Enable the button
    } else {
        console.error('Start Game button not found.');
    }


    const showHierarchyButton = document.getElementById('show-hierarchy');
    if (showHierarchyButton) {
        showHierarchyButton.addEventListener('click', showHierarchyModal);
    } else {
        console.error('Show Hierarchy button not found.');
    }

    const closeHierarchyButton = document.querySelector('.close-button');
    if (closeHierarchyButton) {
        closeHierarchyButton.addEventListener('click', hideHierarchyModal);
    } else {
        console.error('Close Hierarchy button not found.');
    }

    const closeCardInfoButton = document.querySelector('.close-card-info-button');
    if (closeCardInfoButton) {
        closeCardInfoButton.addEventListener('click', hideCardInfoModal);
    } else {
        console.error('Close Card Info button not found.');
    }

    if (endPhaseButton) {
        endPhaseButton.addEventListener('click', endPhase);
    } else {
        console.error('End Phase button not found.');
    }

    window.onclick = function(event) {
        const hierarchyModal = document.getElementById('hierarchy-modal');
        const cardInfoModal = document.getElementById('card-info-modal');
        if (event.target == hierarchyModal) {
            hierarchyModal.style.display = 'none';
        }
        if (event.target == cardInfoModal) {
            cardInfoModal.style.display = 'none';
        }
    };
}



// Start Game
function startGame() {
    console.log('Start Game button clicked.');
    console.log('Deck length:', deck.length);


	    // Show the player hand
    document.getElementById('player-hand').style.display = 'flex';
	
    if (deck.length === 0) {
        console.log('Deck is empty. Cannot start game.');
        showMessage('The game is still loading. Please wait a moment and try again.');
        return;
    }
	
	//Ensure UI elements are assigned
	//initializeGame();
    // Reset game state if necessary
    resetGame();

    // Shuffle and deal cards
    createPlayerDecks();
    shuffleDeck(playerDeck);
    shuffleDeck(opponentDeck);
    drawStartingHands();

    // Render hands on the UI
    renderHands();

    // Disable Start Game button to prevent multiple initializations
    const startGameButton = document.getElementById('start-game');
    if (startGameButton) {
        startGameButton.disabled = true;
    }

    // Update game phases and UI elements as needed
    currentPhase = 'Draw';
    updatePhaseDisplay();

    console.log('Game started.');

    // Begin the game loop or other game functionalities
    gameLoop();
}

// Remove this redundant event listener
// document.addEventListener('DOMContentLoaded', () => {
//     const startGameButton = document.getElementById('start-game');
//     if (startGameButton) {
//         startGameButton.addEventListener('click', startGame);
//         console.log('Start Game button event listener attached.');
//     } else {
//         console.error('Start Game button not found.');
//     }
// });


// Reset Game State
function resetGame() {
	console.log('resetGame() called.');
    playerDeck = [];
    opponentDeck = [];
    playerHand = [];
    opponentHand = [];
    playerTricks = [];
    opponentTricks = [];
    playerGraveyard = [];
    opponentGraveyard = [];
    playerSP = 50;
    opponentSP = 50;
    playerLP = 8000;
    opponentLP = 8000;
    currentPhase = 'Not Started';
    turnPlayer = 'Player';
    stakesMultiplier = 1;
    playerField = [];
    opponentField = [];
    playerNegateAttack = false;
    opponentNegateAttack = false;
    playerNegateSpellTrap = false;
    opponentNegateSpellTrap = false;
    tempEffects = {
        player: [],
        opponent: []
    };
    opponentPlayedCard = null;
    selectedAttackerIndex = null;
    draggedCardIndex = null;
    actionsThisPhase = 0;
    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('player-graveyard-cards').innerHTML = '';
    document.getElementById('opponent-graveyard-cards').innerHTML = '';
    document.getElementById('player-played-card').innerHTML = '';
    document.getElementById('opponent-played-card').innerHTML = '';
    document.getElementById('player-batteries').innerHTML = '';
    document.getElementById('opponent-batteries').innerHTML = '';
    document.getElementById('game-messages').innerHTML = '';
    chatMessagesDiv.innerHTML = '';
    updateSPDisplay();
    updateLPDisplay();
    updatePhaseDisplay();
    document.getElementById('start-game').disabled = false;
    endPhaseButton.style.display = 'none';
    // AI Greeting
    addChatMessage(opponentCharacter, opponentCharacter.dialogues.greetings[Math.floor(Math.random() * opponentCharacter.dialogues.greetings.length)]);
}

// Create Player Decks
function createPlayerDecks() {
    // Shuffle the main deck
    shuffleDeck(deck);

    // Split the deck evenly between the player and the opponent
    const halfDeckSize = Math.floor(deck.length / 2);
    playerDeck = deck.slice(0, halfDeckSize);
    opponentDeck = deck.slice(halfDeckSize);

    // Adjust if necessary
    if (playerDeck.length > opponentDeck.length) {
        opponentDeck.push(playerDeck.pop());
    }
}

// Shuffle Deck
function shuffleDeck(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Draw Starting Hands
function drawStartingHands() {
    for (let i = 0; i < 6; i++) {
        if (playerDeck.length > 0) playerHand.push(playerDeck.pop());
        if (opponentDeck.length > 0) opponentHand.push(opponentDeck.pop());
    }
    console.log('Player Hand after drawing:', playerHand);
    console.log('Opponent Hand after drawing:', opponentHand);
}


// Render Hands
function renderHands() {
	console.log('Rendering player hand:', playerHand);
    const playerCardsDiv = document.getElementById('player-cards');
    playerCardsDiv.innerHTML = '';
    playerHand.forEach((card, index) => {
        const cardDiv = createCardElement(card);
        cardDiv.dataset.index = index;
		cardDiv.addEventListener('click', () => {
			showCardInfo(card, index);
		});
        if (currentPhase === 'Trick-Taking') {
            if (card.type === 'Spell' || card.type === 'Trap') {
                cardDiv.classList.add('grayed-out');
            } else {
                makeCardDraggable(cardDiv, index);
            }
        } else if (currentPhase === 'Summoning') {
            if (card.type === 'Creature') {
                makeCardDraggable(cardDiv, index);
            }
        }
        playerCardsDiv.appendChild(cardDiv);
    });
}

// Make Card Draggable (Touch-Friendly)
function makeCardDraggable(cardDiv, index) {
    cardDiv.classList.add('draggable');
    cardDiv.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        onCardPointerDown(e, index, cardDiv);
    });
}

// Adjusted onCardPointerDown for smoother dragging
function onCardPointerDown(e, cardIndex, cardElement) {
    e.preventDefault();
    draggedCardIndex = cardIndex;
    let initialX = e.clientX || e.touches?.[0]?.clientX || e.pageX;
    let initialY = e.clientY || e.touches?.[0]?.clientY || e.pageY;
    let moved = false;

    let lastX = 0;
    let lastY = 0;

    let lastDropZone = null; // Initialize lastDropZone

    const onPointerMove = (e) => {
        moved = true;
        cardElement.classList.add('dragging');
        let currentX = e.clientX || e.touches?.[0]?.clientX || e.pageX;
        let currentY = e.clientY || e.touches?.[0]?.clientY || e.pageY;
        let dx = currentX - initialX;
        let dy = currentY - initialY;
        lastX = dx;
        lastY = dy;

        // Move the card
        cardElement.style.transform = `translate(${lastX}px, ${lastY}px)`;

        // Highlight drop zones when dragging over them
        const elementUnderCursor = document.elementFromPoint(currentX, currentY);

        // Remove highlight from previous drop zone if any
        if (lastDropZone && lastDropZone !== elementUnderCursor) {
            lastDropZone.classList.remove('hovered-drop-zone');
        }

        // Highlight new drop zone if applicable
        if (elementUnderCursor && elementUnderCursor.classList.contains('drop-zone')) {
            elementUnderCursor.classList.add('hovered-drop-zone');
            lastDropZone = elementUnderCursor;
        } else {
            lastDropZone = null;
        }
    };

    const onPointerUp = (e) => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);

        // Remove highlight from any drop zone
        if (lastDropZone) {
            lastDropZone.classList.remove('hovered-drop-zone');
        }

        cardElement.style.transform = '';
        cardElement.style.zIndex = '';
        cardElement.classList.remove('dragging');

        if (moved) {
            let dropTarget = document.elementFromPoint(e.clientX, e.clientY);
            if (dropTarget && dropTarget.classList.contains('drop-zone')) {
                if (currentPhase === 'Trick-Taking' && turnPlayer === 'Player') {
                    playCard(draggedCardIndex);
                } else if (currentPhase === 'Summoning') {
                    handleSummoningDrop(draggedCardIndex, dropTarget);
                }
            }
        } else {
            // Treat as a click/tap
            showCardInfo(playerHand[cardIndex], cardIndex);
        }
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
}


// Create Card Element
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    // Apply border color based on card type
    if (card.type === 'Creature') {
        if (isTrump(card)) {
            cardDiv.classList.add('taker-card');
        } else {
            cardDiv.classList.add('trickster-card');
        }
    } else if (card.type === 'Spell') {
        cardDiv.classList.add('spell-card');
    } else if (card.type === 'Trap') {
        cardDiv.classList.add('trap-card');
    }

    // Display based on card type
    if (card.type === 'Creature') {
        // Display Suit/Rank and SP
        const suitSymbols = {
            'Hearts': '♥',
            'Diamonds': '♦',
            'Clubs': '♣',
            'Spades': '♠'
        };
        cardDiv.innerHTML = `
            <div class="card-rank">${card.rank || ''}</div>
            <div class="card-suit">${suitSymbols[card.suit] || ''}</div>
            <div class="card-info">SP: ${card.stars || 0}</div>
        `;
    } else if (card.type === 'Spell' || card.type === 'Trap') {
        // Display Spell/Trap name and subtype
        cardDiv.innerHTML = `
            <div class="card-name">${card.name}</div>
            <div class="card-subtype">${card.subtype}</div>
            <div class="card-info">${card.effect.description}</div>
        `;
    } else {
        // Handle other card types if any
        cardDiv.innerHTML = `
            <div class="card-name">${card.name}</div>
        `;
    }

    return cardDiv;
}


// Create Card Back Element
function createCardBackElement() {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    const img = document.createElement('img');
    img.src = 'images/card_back.png';
    cardDiv.appendChild(img);
    return cardDiv;
}

// Main Game Loop
function gameLoop() {
    updatePhaseDisplay();
    renderHands();
    renderBattlefield();
    renderGraveyards();
    endPhaseButton.style.display = 'block';
    actionsThisPhase = 0;

    if (turnPlayer === 'Player') {
        playerTurn();
    } else {
        opponentTurn();
    }
}

// Player's Turn
function playerTurn() {
    switch (currentPhase) {
        case 'Draw':
            playerDrawPhase();
            break;
        case 'Trick-Taking':
            playerTrickTakingPhase();
            break;
        case 'Cracking':
            if (playerCanCrack()) {
                playerCrackingPhase();
            } else {
                currentPhase = 'Summoning';
                gameLoop();
            }
            break;
        case 'Summoning':
            playerSummoningPhase();
            break;
        case 'Battle':
            playerBattlePhase();
            break;
        case 'End':
            playerEndPhase();
            break;
    }
}

// Opponent's Turn
function opponentTurn() {
    switch (currentPhase) {
        case 'Draw':
            opponentDrawPhase();
            break;
        case 'Trick-Taking':
            opponentTrickTakingPhase();
            break;
        case 'Cracking':
            if (opponentCanCrack()) {
                opponentCrackingPhase();
            } else {
                currentPhase = 'Summoning';
                gameLoop();
            }
            break;
        case 'Summoning':
            opponentSummoningPhase();
            break;
        case 'Battle':
            opponentBattlePhase();
            break;
        case 'End':
            opponentEndPhase();
            break;
    }
}

// === PHASE FUNCTIONS ===

// DRAW PHASE
function playerDrawPhase() {
    // Player draws up to 2 cards if hand size is less than 6
    let cardsToDraw = playerHand.length < 6 ? Math.min(6 - playerHand.length, 2) : 0;
    for (let i = 0; i < cardsToDraw; i++) {
        if (playerDeck.length > 0) {
            playerHand.push(playerDeck.pop());
        }
    }
    renderHands();
    currentPhase = 'Trick-Taking';
    gameLoop();
}

function opponentDrawPhase() {
    // Opponent draws up to 2 cards if hand size is less than 6
    let cardsToDraw = opponentHand.length < 6 ? Math.min(6 - opponentHand.length, 2) : 0;
    for (let i = 0; i < cardsToDraw; i++) {
        if (opponentDeck.length > 0) {
            opponentHand.push(opponentDeck.pop());
        }
    }
    currentPhase = 'Trick-Taking';
    gameLoop();
}

// TRICK-TAKING PHASE
function playerTrickTakingPhase() {
    renderHands();
    showMessage('Drag a valid card to the play area to play it for the trick.');

    // Highlight drop zone
    const playerTrickArea = document.getElementById('player-played-card');
    playerTrickArea.classList.add('drop-zone', 'flashing');
}

function opponentTrickTakingPhase() {
    // AI selects a card to play
    let cardIndex = selectOpponentCard();
    const opponentCard = opponentHand.splice(cardIndex, 1)[0];
    opponentPlayedCard = opponentCard;
    displayTrick(null, opponentCard);
    renderHands();
    // AI chat reaction
    addChatMessage(opponentCharacter, 'I play ' + opponentCard.name + '!');
    turnPlayer = 'Player';
    gameLoop();
}

// Play Card Function (Player)
function playCard(playerCardIndex) {
    if (currentPhase !== 'Trick-Taking' || turnPlayer !== 'Player') {
        showMessage("It's not your turn to play a card.");
        return;
    }

    const playerCard = playerHand.splice(playerCardIndex, 1)[0];

    let opponentCard = opponentPlayedCard;
    if (!opponentCard) {
        const opponentCardIndex = selectOpponentCard(playerCard);
        opponentCard = opponentHand.splice(opponentCardIndex, 1)[0];
        // AI chat reaction
        addChatMessage(opponentCharacter, 'I respond with ' + opponentCard.name + '!');
    }

    displayTrick(playerCard, opponentCard);
    determineTrickWinner(playerCard, opponentCard);
    renderHands();

    // Proceed to Cracking Phase or Summoning Phase
    currentPhase = 'Cracking';
    turnPlayer = 'Player';
    gameLoop();
}

// Select Opponent's Card (AI Logic)
function selectOpponentCard(playerCard = null) {
    // Simplified AI logic for selecting a card
    // AI will try to follow suit if possible
    let validCards = opponentHand.filter(card => !(card.type === 'Spell' || card.type === 'Trap'));

    if (playerCard) {
        let suitCards = validCards.filter(card => card.suit === playerCard.suit);
        if (suitCards.length > 0) {
            validCards = suitCards;
        }
    }

    // For simplicity, AI plays a random valid card
    const cardIndex = opponentHand.indexOf(validCards[Math.floor(Math.random() * validCards.length)]);
    return cardIndex;
}

// Display Trick
function displayTrick(playerCard, opponentCard) {
    const playerTrickArea = document.getElementById('player-played-card');
    const opponentTrickArea = document.getElementById('opponent-played-card');
    playerTrickArea.innerHTML = '';
    opponentTrickArea.innerHTML = '';

    if (playerCard) {
        const playerCardDiv = createCardElement(playerCard);
        playerTrickArea.appendChild(playerCardDiv);
    }

    if (opponentCard) {
        const opponentCardDiv = createCardElement(opponentCard);
        opponentTrickArea.appendChild(opponentCardDiv);
    }

    // Remove drop zone highlight
    playerTrickArea.classList.remove('flashing', 'drop-zone');
}

// Determine Trick Winner
function determineTrickWinner(playerCard, opponentCard) {
    const leadSuit = turnPlayer === 'Player' ? playerCard.suit : opponentCard.suit;

    let playerWins = compareCards(playerCard, opponentCard, leadSuit);

    if (playerWins) {
        playerTricks.push(playerCard, opponentCard);
        // Send cards to player's graveyard
        playerGraveyard.push(playerCard, opponentCard);
        showMessage('You win the trick!');
        // Player gains SP from stars
        const spGained = (getCardStars(playerCard) + getCardStars(opponentCard)) * stakesMultiplier;
        playerSP += spGained;
        updateSPDisplay();
        // AI chat reaction
        addChatMessage(opponentCharacter, opponentCharacter.dialogues.loseTrick[Math.floor(Math.random() * opponentCharacter.dialogues.loseTrick.length)]);
    } else {
        opponentTricks.push(playerCard, opponentCard);
        // Send cards to opponent's graveyard
        opponentGraveyard.push(playerCard, opponentCard);
        showMessage('Opponent wins the trick!');
        // Opponent gains SP from stars
        const spGained = (getCardStars(playerCard) + getCardStars(opponentCard)) * stakesMultiplier;
        opponentSP += spGained;
        updateSPDisplay();
        // AI chat reaction
        addChatMessage(opponentCharacter, opponentCharacter.dialogues.winTrick[Math.floor(Math.random() * opponentCharacter.dialogues.winTrick.length)]);
    }

    // Remove played cards from the play area
    document.getElementById('player-played-card').innerHTML = '';
    document.getElementById('opponent-played-card').innerHTML = '';

    // Remove trick-taking highlights
    const playerTrickArea = document.getElementById('player-played-card');
    playerTrickArea.classList.remove('flashing', 'drop-zone');

    // Switch turn player for next trick
    turnPlayer = playerWins ? 'Player' : 'Opponent';
    opponentPlayedCard = null;
    renderGraveyards();
}

// Get Card Stars
function getCardStars(card) {
    const rankPoints = {
        'Ace': 11,
        '10': 10,
        'King': 4,
        'Queen': 3,
        'Jack': 2
    };
    return rankPoints[card.rank] || 0;
}

// Compare Cards According to Sheepshead Rules
function compareCards(card1, card2, leadSuit) {
    const card1Value = getCardValue(card1, leadSuit);
    const card2Value = getCardValue(card2, leadSuit);

    // Higher value wins
    if (card1Value > card2Value) {
        return turnPlayer === 'Player';
    } else if (card1Value < card2Value) {
        return turnPlayer !== 'Player';
    } else {
        // If tied, leader wins
        return turnPlayer === 'Player';
    }
}

// Get Card Value Based on Hierarchy
function getCardValue(card, leadSuit) {
    // Trump Cards
    if (isTrump(card)) {
        return getTrumpValue(card);
    }
    // Leading Suit Cards
    if (card.suit === leadSuit) {
        return getSuitValue(card);
    }
    // Fail Suit Cards
    return getSuitValue(card) - 100; // Ensure they rank below lead suit cards
}

// Check if Card is Trump
function isTrump(card) {
    if (card.rank === 'Queen' || card.rank === 'Jack' || card.suit === trumpSuit) {
        return true;
    }
    return false;
}

// Get Trump Card Value
function getTrumpValue(card) {
    const trumpOrder = [
        'Queen of Clubs',
        'Queen of Spades',
        'Queen of Hearts',
        'Queen of Diamonds',
        'Jack of Clubs',
        'Jack of Spades',
        'Jack of Hearts',
        'Jack of Diamonds',
        'Ace of Diamonds',
        '10 of Diamonds',
        'King of Diamonds',
        '9 of Diamonds',
        '8 of Diamonds',
        '7 of Diamonds'
    ];

    const index = trumpOrder.indexOf(card.name);
    return 1000 - index; // Higher index means lower value
}

// Get Suit Card Value
function getSuitValue(card) {
    const rankOrder = {
        'Ace': 14,
        '10': 13,
        'King': 12,
        '9': 9,
        '8': 8,
        '7': 7
    };
    return rankOrder[card.rank] || 0;
}

// CRACKING PHASE
function playerCrackingPhase() {
    highlightCrackingCards();
    showMessage('Do you want to declare a crack to double the stakes?');
    showOptions([
        {
            label: 'Declare Crack',
            action: () => {
                stakesMultiplier *= 2;
                showMessage(`You declared a crack! Stakes are now multiplied by ${stakesMultiplier}.`);
                removeCrackButtons();
                removeCrackingHighlights();
                opponentCrackingPhase(true);
            }
        },
        {
            label: 'Do Not Crack',
            action: () => {
                removeCrackButtons();
                removeCrackingHighlights();
                currentPhase = 'Summoning';
                gameLoop();
            }
        }
    ]);
}

function opponentCrackingPhase(playerCracked = false) {
    // Simplified AI logic
    let canCrack = opponentCanCrack();
    if (playerCracked) {
        if (canCrack) {
            stakesMultiplier *= 2;
            showMessage(`Opponent declared a recrack! Stakes are now multiplied by ${stakesMultiplier}.`);
            // AI chat reaction
            addChatMessage(opponentCharacter, 'I declare a recrack!');
            currentPhase = 'Summoning';
            gameLoop();
        } else {
            currentPhase = 'Summoning';
            gameLoop();
        }
    } else {
        if (canCrack && Math.random() < 0.5) {
            stakesMultiplier *= 2;
            showMessage(`Opponent declared a crack! Stakes are now multiplied by ${stakesMultiplier}.`);
            // AI chat reaction
            addChatMessage(opponentCharacter, 'I declare a crack!');
            // Player may Recrack
            playerCrackingPhase();
        } else {
            currentPhase = 'Summoning';
            gameLoop();
        }
    }
}

// Check if Player Can Crack
function playerCanCrack() {
    // Check if player has at least two high-value Taker cards or 500 SP
    let highTakers = playerHand.filter(card => (card.rank === 'Queen' || card.rank === 'Jack') && isTrump(card));
    return highTakers.length >= 2 || playerSP >= 500;
}

// Check if Opponent Can Crack
function opponentCanCrack() {
    // Simplified logic
    let highTakers = opponentHand.filter(card => (card.rank === 'Queen' || card.rank === 'Jack') && isTrump(card));
    return highTakers.length >= 2 || opponentSP >= 500;
}

function highlightCrackingCards() {
    const crackingCards = playerHand.filter(card => (card.rank === 'Queen' || card.rank === 'Jack') && isTrump(card));
    crackingCards.forEach(card => {
        const index = playerHand.indexOf(card);
        const cardElement = document.querySelector(`.card[data-index="${index}"]`);
        if (cardElement) {
            cardElement.classList.add('cracking-highlight');
        }
    });
}

function removeCrackingHighlights() {
    const highlightedCards = document.querySelectorAll('.cracking-highlight');
    highlightedCards.forEach(cardElement => {
        cardElement.classList.remove('cracking-highlight');
    });
}

function showOptions(options) {
    const playTable = document.getElementById('play-table');
    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('crack-buttons');

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.label;
        button.addEventListener('click', option.action);
        buttonsDiv.appendChild(button);
    });

    playTable.appendChild(buttonsDiv);
}

function removeCrackButtons() {
    const buttonsDiv = document.querySelector('.crack-buttons');
    if (buttonsDiv) {
        buttonsDiv.remove();
    }
}

function removePreviousHighlights() {
    const highlightedElements = document.querySelectorAll('.highlight, .drop-zone, .flashing');
    highlightedElements.forEach(element => {
        element.classList.remove('highlight', 'drop-zone', 'flashing');
    });
}


// SUMMONING PHASE
function playerSummoningPhase() {
    // Remove previous highlights
    removePreviousHighlights();

    showMessage('Drag creatures from your hand to your field to summon them.');
    setupSummoning();
    highlightBatterySlots();
    // Lower the z-index of the player's hand
    document.getElementById('player-hand').style.zIndex = '1';
}


function setupSummoning() {
    // Summoning setup if needed
}

// Highlight 16 battery slots during summoning
function highlightBatterySlots() {
    for (let i = 1; i <= 16; i++) {
        const slot = document.getElementById(`battery-slot-${i}`);
        if (!playerField[i - 1]) { // Only highlight empty slots
            slot.classList.add('highlight', 'drop-zone');
        }
    }
}


function removeBatterySlotHighlights() {
    for (let i = 1; i <= 16; i++) {
        const slot = document.getElementById(`battery-slot-${i}`);
        slot.classList.remove('highlight', 'drop-zone');
    }
}

// Adjust handleSummoningDrop to place cards into the correct slot
function handleSummoningDrop(cardIndex, dropZone) {
    const slotId = dropZone.id;
    const slotNumber = parseInt(slotId.split('-')[2]);
    // Ensure the slot is valid and available
    if (slotNumber && !playerField[slotNumber - 1]) {
        const card = playerHand[cardIndex];
        if (card.level && playerSP >= card.level) {
            playerSP -= card.level;
            updateSPDisplay();
            playerHand.splice(cardIndex, 1);

            // Create a new Battery with the summoned creature
            const battery = {
                active: card,
                inactives: []
            };
            playerField[slotNumber - 1] = battery;

            showMessage(`You summoned ${card.name}!`);
            renderHands();
            renderBattlefield();
            actionsThisPhase++;
        } else {
            showMessage('Not enough SP to summon this creature.');
        }
    } else {
        showMessage('This slot is already occupied.');
    }
}

// Opponent Summoning Phase
function opponentSummoningPhase() {
    // AI summoning logic
    opponentSummonCreatures();
    currentPhase = 'Battle';
    gameLoop();
}

// Opponent Summon Creatures
function opponentSummonCreatures() {
    let summonableCards = opponentHand.filter(card => card.type === 'Creature' && card.level && card.level <= opponentSP);
    if (summonableCards.length > 0) {
        let card = selectOptimalCreature(summonableCards);
        if (card) {
            opponentSP -= card.level;
            opponentHand.splice(opponentHand.indexOf(card), 1);

            let battery = {
                active: card,
                inactives: []
            };
            opponentField.push(battery);

            showMessage(`Opponent summoned ${card.name}!`);
            // AI chat reaction
            addChatMessage(opponentCharacter, opponentCharacter.dialogues.summon[Math.floor(Math.random() * opponentCharacter.dialogues.summon.length)]);
            updateSPDisplay();
            renderBattlefield();

            // AI may set spells/traps
            opponentSetInactives();
        }
    }
}

function selectOptimalCreature(creatures) {
    // Evaluate creatures based on current needs (defense, offense)
    // Simplified example:
    let bestCreature = null;
    let highestValue = 0;
    creatures.forEach(creature => {
        let value = creature.level;
        if (value > highestValue) {
            highestValue = value;
            bestCreature = creature;
        }
    });
    return bestCreature;
}

function opponentSetInactives() {
    let setCards = opponentHand.filter(card => card.type === 'Spell' || card.type === 'Trap');
    if (setCards.length > 0 && opponentField.length > 0) {
        let card = setCards[0]; // AI selects the first spell/trap
        opponentHand.splice(opponentHand.indexOf(card), 1);
        let battery = opponentField[0]; // AI sets under the first battery
        if (battery.inactives.length < 2) {
            battery.inactives.push(card);
            showMessage(`Opponent sets a card under ${battery.active.name}.`);
            renderBattlefield();
        }
    }
}

// BATTLE PHASE
function playerBattlePhase() {
    // Reset z-index after summoning phase
    document.getElementById('player-hand').style.zIndex = '5';

    if (playerField.length === 0) {
        showMessage('You have no creatures to attack with.');
        return;
    }
    showMessage('Select one of your creatures to attack.');

    // Highlight player's active creatures
    playerField.forEach((battery, index) => {
        const batteryDiv = document.getElementById(`player-battery-${index}`);
        batteryDiv.classList.add('flashing');
        batteryDiv.addEventListener('click', () => {
            showAbilityOptions(battery, index);
        });
    });
}

function showAbilityOptions(battery, index) {
    const abilitiesDiv = document.createElement('div');
    abilitiesDiv.classList.add('ability-list');

    ['weak', 'middle', 'strong'].forEach(tier => {
        const ability = battery.active.abilities[tier];
        const button = document.createElement('button');
        button.textContent = `${tier.charAt(0).toUpperCase() + tier.slice(1)} Attack (SP Cost: ${ability.sp_cost}, Power: ${ability.power})`;
        button.addEventListener('click', () => {
            if (playerSP < ability.sp_cost) {
                showMessage('Not enough SP to activate this ability.');
                return;
            }
            playerSP -= ability.sp_cost;
            updateSPDisplay();
            battery.selectedAbility = ability;
            battery.selectedAbilityTier = tier;
            showMessage(`You selected ${battery.active.name}'s ${tier} attack. Now select a target.`);
            removePlayerHighlights();
            enableAttackTargets(index);
        });
        abilitiesDiv.appendChild(button);
    });

    // Remove any existing ability list
    const batteryDiv = document.getElementById(`player-battery-${index}`);
    const existingAbilitiesDiv = batteryDiv.querySelector('.ability-list');
    if (existingAbilitiesDiv) existingAbilitiesDiv.remove();

    // Append abilitiesDiv to the batteryDiv
    batteryDiv.appendChild(abilitiesDiv);
}

function removePlayerHighlights() {
    playerField.forEach((battery, index) => {
        const batteryDiv = document.getElementById(`player-battery-${index}`);
        batteryDiv.classList.remove('flashing');
        batteryDiv.replaceWith(batteryDiv.cloneNode(true)); // Remove event listeners
    });
}

function enableAttackTargets(attackerIndex) {
    // Add click events to opponent's creatures
    if (opponentField.length > 0) {
        opponentField.forEach((battery, index) => {
            const batteryDiv = document.getElementById(`opponent-battery-${index}`);
            batteryDiv.classList.add('flashing');
            batteryDiv.addEventListener('click', () => {
                executeAttack(attackerIndex, index);
            });
        });
    } else {
        // Direct attack
        showMessage('No opponent creatures. Click on the opponent\'s field to attack directly.');
        const opponentSideDiv = document.getElementById('opponent-side');
        opponentSideDiv.classList.add('flashing');
        opponentSideDiv.addEventListener('click', () => {
            executeAttack(attackerIndex, null);
        });
    }
}

function executeAttack(attackerIndex, targetIndex) {
    const attackerBattery = playerField[attackerIndex];
    const attacker = attackerBattery.active;
    const ability = attackerBattery.selectedAbility;

    // Remove ability selection UI
    const batteryDiv = document.getElementById(`player-battery-${attackerIndex}`);
    const abilitiesDiv = batteryDiv.querySelector('.ability-list');
    if (abilitiesDiv) abilitiesDiv.remove();

    // Remove flashing classes and event listeners
    opponentField.forEach((battery, index) => {
        const batteryDiv = document.getElementById(`opponent-battery-${index}`);
        batteryDiv.classList.remove('flashing');
        batteryDiv.replaceWith(batteryDiv.cloneNode(true)); // Remove event listeners
    });
    const opponentSideDiv = document.getElementById('opponent-side');
    opponentSideDiv.classList.remove('flashing');
    opponentSideDiv.replaceWith(opponentSideDiv.cloneNode(true));

    if (targetIndex !== null) {
        // Attacking opponent's creature
        const defenderBattery = opponentField[targetIndex];
        const defender = defenderBattery.active;

        // Apply attacker's ability effect if any
        if (ability.effect) {
            handleCardEffect(ability.effect, 'Player');
        }

        // Damage calculation
        if (ability.power > defender.def) {
            // Defender destroyed
            showMessage(`${defender.name} is destroyed!`);
            opponentField.splice(targetIndex, 1);
            renderBattlefield();
            // Apply damage to opponent LP
            let damage = (ability.power - defender.def) * stakesMultiplier;
            opponentLP -= damage;
            updateLPDisplay();
            checkWinCondition();
            // Activate defender's inactives
            activateInactives(defenderBattery, 'Opponent');
            // AI chat reaction
            addChatMessage(opponentCharacter, 'No! My creature was destroyed!');
        } else if (ability.power < defender.def) {
            // Attacker destroyed
            showMessage(`${attacker.name} is destroyed!`);
            playerField.splice(attackerIndex, 1);
            renderBattlefield();
            let damage = (defender.def - ability.power) * stakesMultiplier;
            playerLP -= damage;
            updateLPDisplay();
            checkWinCondition();
            // Activate attacker's inactives
            activateInactives(attackerBattery, 'Player');
            // AI chat reaction
            addChatMessage(opponentCharacter, 'Your creature is no match for mine!');
        } else {
            // Neither destroyed
            showMessage('Neither creature is destroyed.');
            // AI chat reaction
            addChatMessage(opponentCharacter, 'A stalemate, it seems.');
        }
    } else {
        // Direct attack
        opponentLP -= ability.power * stakesMultiplier;
        updateLPDisplay();
        checkWinCondition();
        showMessage(`You dealt ${ability.power * stakesMultiplier} damage to opponent's Life Points!`);
        // AI chat reaction
        addChatMessage(opponentCharacter, 'Argh! Direct hit!');
    }

    actionsThisPhase++;
    // Check if all creatures have acted
    if (actionsThisPhase >= playerField.length) {
        currentPhase = 'End';
        gameLoop();
    } else {
        playerBattlePhase();
    }
}

function opponentBattlePhase() {
    if (opponentField.length === 0) {
        showMessage('Opponent has no creatures to attack with.');
        currentPhase = 'End';
        gameLoop();
        return;
    }
    // AI attacks with creatures based on strategy
    opponentField.forEach((battery, index) => {
        const attacker = battery.active;
        // AI selects the best ability it can afford
        let ability = selectBestAbility(attacker, opponentSP);
        if (!ability) {
            return;
        }
        opponentSP -= ability.sp_cost;
        updateSPDisplay();

        // Decide whether to attack a creature or directly
        if (playerField.length > 0) {
            let targetIndex = selectTargetCreature();
            executeOpponentAttack(index, targetIndex, ability);
        } else {
            // Direct attack
            playerLP -= ability.power * stakesMultiplier;
            updateLPDisplay();
            checkWinCondition();
            showMessage(`Opponent deals ${ability.power * stakesMultiplier} damage to your Life Points!`);
            // AI chat reaction
            addChatMessage(opponentCharacter, opponentCharacter.dialogues.attack[Math.floor(Math.random() * opponentCharacter.dialogues.attack.length)]);
        }
    });
    currentPhase = 'End';
    gameLoop();
}

function selectBestAbility(creature, spAvailable) {
    // AI chooses the strongest ability it can afford
    if (spAvailable >= creature.abilities.strong.sp_cost) {
        return creature.abilities.strong;
    } else if (spAvailable >= creature.abilities.middle.sp_cost) {
        return creature.abilities.middle;
    } else if (spAvailable >= creature.abilities.weak.sp_cost) {
        return creature.abilities.weak;
    } else {
        return null;
    }
}

function selectTargetCreature() {
    // AI prioritizes targets based on threat level
    let targetIndex = 0;
    let highestDEF = 0;
    playerField.forEach((battery, index) => {
        if (battery.active.def > highestDEF) {
            highestDEF = battery.active.def;
            targetIndex = index;
        }
    });
    return targetIndex;
}

function executeOpponentAttack(attackerIndex, targetIndex, ability) {
    const attackerBattery = opponentField[attackerIndex];
    const attacker = attackerBattery.active;
    const defenderBattery = playerField[targetIndex];
    const defender = defenderBattery.active;

    // Apply attacker's ability effect if any
    if (ability.effect) {
        handleCardEffect(ability.effect, 'Opponent');
    }

    if (ability.power > defender.def) {
        showMessage(`Opponent's ${attacker.name} destroys your ${defender.name}!`);
        playerField.splice(targetIndex, 1);
        renderBattlefield();
        let damage = (ability.power - defender.def) * stakesMultiplier;
        playerLP -= damage;
        updateLPDisplay();
        checkWinCondition();
        activateInactives(defenderBattery, 'Player');
        // AI chat reaction
        addChatMessage(opponentCharacter, 'Your creature is no match for mine!');
    } else if (ability.power < defender.def) {
        showMessage(`Opponent's ${attacker.name} is destroyed by your ${defender.name}!`);
        opponentField.splice(attackerIndex, 1);
        renderBattlefield();
        let damage = (defender.def - ability.power) * stakesMultiplier;
        opponentLP -= damage;
        updateLPDisplay();
        checkWinCondition();
        activateInactives(attackerBattery, 'Opponent');
        // AI chat reaction
        addChatMessage(opponentCharacter, 'Impossible!');
    } else {
        showMessage('Neither creature is destroyed.');
        // AI chat reaction
        addChatMessage(opponentCharacter, 'A stalemate, it seems.');
    }
}

// END PHASE
function playerEndPhase() {
    // Discard down to six cards if necessary
    while (playerHand.length > 6) {
        let discardedCard = playerHand.pop();
        playerDeck.unshift(discardedCard); // Place it back on the deck bottom
    }
    endTurnEffects('Player');
    // Prepare for opponent's turn
    currentPhase = 'Draw';
    turnPlayer = 'Opponent';
    endPhaseButton.style.display = 'none';
    gameLoop();
}

function opponentEndPhase() {
    // AI discards down to six cards if necessary
    while (opponentHand.length > 6) {
        let discardedCard = opponentHand.pop();
        opponentDeck.unshift(discardedCard);
    }
    endTurnEffects('Opponent');
    // Prepare for player's turn
    currentPhase = 'Draw';
    turnPlayer = 'Player';
    gameLoop();
}

// === UTILITY FUNCTIONS ===

function renderBattlefield() {
    const playerBatteriesDiv = document.getElementById('player-batteries');
    playerBatteriesDiv.innerHTML = '';
    playerField.forEach((battery, index) => {
        const batteryDiv = createBatteryElement(battery, 'Player', index);
        batteryDiv.id = `player-battery-${index}`;
        playerBatteriesDiv.appendChild(batteryDiv);
    });

    const opponentBatteriesDiv = document.getElementById('opponent-batteries');
    opponentBatteriesDiv.innerHTML = '';
    opponentField.forEach((battery, index) => {
        const batteryDiv = createBatteryElement(battery, 'Opponent', index);
        batteryDiv.id = `opponent-battery-${index}`;
        batteryDiv.addEventListener('click', () => {
            showCardInfo(battery.active);
        });
        opponentBatteriesDiv.appendChild(batteryDiv);
    });
}

function createBatteryElement(battery, owner, index) {
    const batteryDiv = document.createElement('div');
    batteryDiv.classList.add('battery');

    // Active Card
    const activeCardDiv = document.createElement('div');
    activeCardDiv.classList.add('card');

    // Apply border color based on card type
    if (isTrump(battery.active)) {
        activeCardDiv.classList.add('taker-card');
    } else {
        activeCardDiv.classList.add('trickster-card');
    }

    activeCardDiv.innerHTML = `
        <div class="card-rank">Level: ${battery.active.level}</div>
        <div class="card-suit">DEF: ${battery.active.def}</div>
    `;
    activeCardDiv.addEventListener('click', () => {
        showCardInfo(battery.active);
    });
    batteryDiv.appendChild(activeCardDiv);

    // Inactive Cards (face-down)
    battery.inactives.forEach(card => {
        const cardDiv = createCardBackElement();
        batteryDiv.appendChild(cardDiv);
    });

    return batteryDiv;
}

function updateSPDisplay() {
    playerSPDisplay.textContent = playerSP;
    opponentSPDisplay.textContent = opponentSP;
}

function updateLPDisplay() {
    playerLPDisplay.textContent = playerLP;
    opponentLPDisplay.textContent = opponentLP;
}

function updatePhaseDisplay() {
    currentPhaseDisplay.textContent = currentPhase + ' Phase';
    turnPlayerDisplay.textContent = turnPlayer;
}

function checkWinCondition() {
    if (playerLP <= 0) {
        showMessage('You lose!');
        // AI chat reaction
        addChatMessage(opponentCharacter, opponentCharacter.dialogues.winTrick[Math.floor(Math.random() * opponentCharacter.dialogues.winTrick.length)]);
        resetGame();
    } else if (opponentLP <= 0) {
        showMessage('You win!');
        // AI chat reaction
        addChatMessage(opponentCharacter, opponentCharacter.dialogues.defeat[Math.floor(Math.random() * opponentCharacter.dialogues.defeat.length)]);
        resetGame();
    }
}

function activateInactives(battery, owner) {
    battery.inactives.forEach(card => {
        showMessage(`${owner}'s ${card.name} activates!`);
        handleCardEffect(card.effect, owner);
    });
    battery.inactives = []; // Clear inactives after activation
}

function handleCardEffect(effect, owner) {
    if (!effect) return;
    switch (effect.type) {
        case 'IncreaseDEF':
            increaseDEF(effect, owner);
            break;
        case 'NegateAttack':
            negateAttack(effect, owner);
            break;
        case 'NegateSpellTrap':
            negateSpellTrap(effect, owner);
            break;
        case 'GainLP':
            restoreLifePoints(effect, owner);
            break;
        case 'DealDamage':
            dealDamage(effect, owner);
            break;
        // Add more cases for other effect types
        default:
            console.log('Unknown effect type:', effect.type);
    }
}

function increaseDEF(effect, owner) {
    let field = owner === 'Player' ? playerField : opponentField;
    field.forEach(battery => {
        battery.active.def += effect.amount;
    });
    showMessage(`${owner}'s creatures gain ${effect.amount} DEF.`);
    // Store effect to revert later if necessary
}

function negateAttack(effect, owner) {
    if (owner === 'Player') {
        playerNegateAttack = true;
    } else {
        opponentNegateAttack = true;
    }
    showMessage(`${owner} will negate the next attack.`);
}

function negateSpellTrap(effect, owner) {
    if (owner === 'Player') {
        playerNegateSpellTrap = true;
    } else {
        opponentNegateSpellTrap = true;
    }
    showMessage(`${owner} will negate the next spell or trap effect.`);
}

function restoreLifePoints(effect, owner) {
    let amount = effect.amount * stakesMultiplier;
    if (owner === 'Player') {
        playerLP += amount;
        updateLPDisplay();
        showMessage(`You restore ${amount} Life Points!`);
    } else {
        opponentLP += amount;
        updateLPDisplay();
        showMessage(`Opponent restores ${amount} Life Points!`);
    }
}

function dealDamage(effect, owner) {
    let amount = effect.amount * stakesMultiplier;
    if (owner === 'Player') {
        opponentLP -= amount;
        updateLPDisplay();
        showMessage(`You deal ${amount} damage to opponent!`);
    } else {
        playerLP -= amount;
        updateLPDisplay();
        showMessage(`Opponent deals ${amount} damage to you!`);
    }
    checkWinCondition();
}

function endTurnEffects(owner) {
    // Revert temporary effects if necessary
}

function showMessage(message) {
    const gameMessagesDiv = document.getElementById('game-messages');
    gameMessagesDiv.innerHTML = `<p>${message}</p>`;
}

function showHierarchyModal() {
    const modal = document.getElementById('hierarchy-modal');
    modal.style.display = 'block';
    const contentDiv = document.getElementById('hierarchy-content');
    contentDiv.innerHTML = `
        <h3>Trump Cards (Highest to Lowest):</h3>
        <p>Q♣, Q♠, Q♥, Q♦, J♣, J♠, J♥, J♦, A♦, 10♦, K♦, 9♦, 8♦, 7♦</p>
        <h3>Fail Suit Cards:</h3>
        <p>A, 10, K, 9, 8, 7 of Hearts, Clubs, Spades</p>
        <h3>Card Points:</h3>
        <p>Ace: 11 points</p>
        <p>Ten: 10 points</p>
        <p>King: 4 points</p>
        <p>Queen: 3 points</p>
        <p>Jack: 2 points</p>
        <p>9, 8, 7: 0 points</p>
    `;
}

function hideHierarchyModal() {
    const modal = document.getElementById('hierarchy-modal');
    modal.style.display = 'none';
}

function showCardInfo(card, index) {
    const modal = document.getElementById('card-info-modal');
    modal.style.display = 'block';
    const cardInfoDiv = document.getElementById('card-info-details');
    cardInfoDiv.innerHTML = `
        <h3>${card.name}</h3>
        <img src="${card.image || 'images/card_placeholder.png'}" alt="${card.name}" style="width:100%;">
        <p>Type: ${card.type}</p>
        <p>Suit: ${card.suit}</p>
        <p>Rank: ${card.rank}</p>
        <p>Level: ${card.level || '-'}</p>
        <p>DEF: ${card.def || '-'}</p>
        <p>Stars: ${getCardStars(card)}</p>
        <p>Abilities:</p>
        <ul>
            <li>Weak Attack: Power ${card.abilities.weak.power}, SP Cost ${card.abilities.weak.sp_cost}</li>
            <li>Middle Attack: Power ${card.abilities.middle.power}, SP Cost ${card.abilities.middle.sp_cost}</li>
            <li>Strong Attack: Power ${card.abilities.strong.power}, SP Cost ${card.abilities.strong.sp_cost}</li>
        </ul>
        <p>${card.flavor_text || ''}</p>
    `;
	    const cardElement = document.querySelector(`.card[data-index="${index}"]`);
    if (cardElement) {
        cardElement.classList.add('selected');
    }
}

function hideCardInfoModal() {
    const modal = document.getElementById('card-info-modal');
    modal.style.display = 'none';
	// Move the card back down
    const selectedCard = document.querySelector('.card.selected');
    if (selectedCard) {
        selectedCard.classList.remove('selected');
    }
}

function endPhase() {
    switch (currentPhase) {
        case 'Summoning':
            currentPhase = 'Battle';
            removeBatterySlotHighlights();
            gameLoop();
            break;
        case 'Battle':
            currentPhase = 'End';
            gameLoop();
            break;
    }
}

// Chat Functions
function addChatMessage(character, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');

    const avatarImg = document.createElement('img');
    avatarImg.src = character.avatar;
    avatarImg.alt = character.name;
    avatarImg.classList.add('chat-avatar');

    const textDiv = document.createElement('div');
    textDiv.classList.add('chat-text');
    textDiv.textContent = message;

    messageDiv.appendChild(avatarImg);
    messageDiv.appendChild(textDiv);

    chatMessagesDiv.appendChild(messageDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

function renderGraveyards() {
    const playerGraveyardDiv = document.getElementById('player-graveyard-cards');
    playerGraveyardDiv.innerHTML = '';
    if (playerGraveyard.length > 0) {
        const cardDiv = createCardBackElement();
        playerGraveyardDiv.appendChild(cardDiv);
    }

    const opponentGraveyardDiv = document.getElementById('opponent-graveyard-cards');
    opponentGraveyardDiv.innerHTML = '';
    if (opponentGraveyard.length > 0) {
        const cardDiv = createCardBackElement();
        opponentGraveyardDiv.appendChild(cardDiv);
    }
}
