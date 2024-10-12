// Global Variables
let gameState = {
    player: {
        deck: [],
        hand: [],
        field: [],
        discardPile: [],
        lifePoints: 8000,
        summoningPoints: 1000,
    },
    ai: {
        deck: [],
        hand: [],
        field: [],
        discardPile: [],
        lifePoints: 8000,
        summoningPoints: 1000,
    },
    currentPhase: 'setup',
    trick: [],
    turn: 'player', // or 'ai'
};

// Load card data
let allCards = [];

fetch('cards.json')
    .then(response => response.json())
    .then(data => {
        allCards = data;
        // Initialize the game after loading cards
        initGame();
    })
    .catch(error => console.error('Error loading card data:', error));

// Initialize the game
function initGame() {
    // Show game setup
    displayGameSetup();
}

// Display Game Setup
function displayGameSetup() {
    const gameSetupDiv = document.getElementById('gameSetup');
    gameSetupDiv.innerHTML = `
        <h2>Choose Your Deck</h2>
        <select id="deckSelect">
            <option value="spades">Sovereign Guardians (Spades)</option>
            <option value="clubs">Alexander's Conquest (Clubs)</option>
            <option value="hearts">Charlemagne's Empire (Hearts)</option>
            <option value="diamonds">Caesar's Legions (Diamonds)</option>
        </select>
        <button id="startGameButton">Start Game</button>
    `;

    document.getElementById('startGameButton').addEventListener('click', startGame);
}

function startTurn() {
    gameState.currentPhase = 'drawingPhase';
    drawingPhase();
}

function drawingPhase() {
    // Players draw cards at the beginning of each turn
    drawCardsAtTurnStart(gameState.player);
    drawCardsAtTurnStart(gameState.ai);
    updatePlayerInfo();

    displayGameMessage('Starting Drawing Phase');
    displayPlayerHand();

    // Proceed to Trick-Taking Phase
    setTimeout(startTrickTakingPhase, 1000);
}

// Start the Game
function startGame() {
    const selectedDeck = document.getElementById('deckSelect').value;

    // Initialize player's deck based on selection
    gameState.player.deck = allCards.filter(card => card.deck === selectedDeck);

    // Initialize AI deck (choose a different deck)
    const aiDeckOptions = ['spades', 'clubs', 'hearts', 'diamonds'].filter(deck => deck !== selectedDeck);
    const aiDeckChoice = aiDeckOptions[Math.floor(Math.random() * aiDeckOptions.length)];
    gameState.ai.deck = allCards.filter(card => card.deck === aiDeckChoice);

    // Shuffle decks
    shuffleDeck(gameState.player.deck);
    shuffleDeck(gameState.ai.deck);

    gameState.player.hand = [];
    gameState.ai.hand = [];

    // Draw initial hands
    drawCards(gameState.player, 6);
    drawCards(gameState.ai, 6);

    // Update Life Points and Summoning Points display
    updatePlayerInfo();

    // Hide setup and show game area
    document.getElementById('gameSetup').classList.add('hidden');
    document.getElementById('gameArea').classList.remove('hidden');

    // Start the first turn
    gameState.turn = 'player'; // Or decide randomly if needed
    startTurn();
}

// Shuffle Deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Draw Cards
function drawCards(player, number) {
    for (let i = 0; i < number; i++) {
        if (player.deck.length > 0) {
            player.hand.push(player.deck.pop());
        } else {
            // If the deck is empty, shuffle the discard pile back into the deck
            if (player.discardPile.length > 0) {
                player.deck = [...player.discardPile];
                player.discardPile = [];
                shuffleDeck(player.deck);
                player.hand.push(player.deck.pop());
            } else {
                // No cards left to draw
                break;
            }
        }
    }
}


// Update Player Info Display
function updatePlayerInfo() {
    document.getElementById('playerLifePoints').innerText = gameState.player.lifePoints;
    document.getElementById('playerSummoningPoints').innerText = gameState.player.summoningPoints;

    document.getElementById('aiLifePoints').innerText = gameState.ai.lifePoints;
    document.getElementById('aiSummoningPoints').innerText = gameState.ai.summoningPoints;
}

// Start Trick-Taking Phase
function startTrickTakingPhase() {
    gameState.currentPhase = 'trickTakingPhase';
    displayGameMessage('Starting Trick-Taking Phase');
    displayControlsForTrickTaking();
}



// Function to draw cards at the beginning of the turn
function drawCardsAtTurnStart(player) {
    let cardsToDraw = 2;
    if (player.hand.length >= 5) {
        cardsToDraw = 1;
    }
    drawCards(player, cardsToDraw);
}

// Display Game Message
function displayGameMessage(message) {
    const gameMessagesDiv = document.getElementById('gameMessages');
    gameMessagesDiv.innerText = message;
}

// Display Player Hand
function displayPlayerHand() {
    const playerHandDiv = document.getElementById('playerHand');
    playerHandDiv.innerHTML = ''; // Clear previous hand

    gameState.player.hand.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerText = `${card.name}\n(${card.suit || card.type})`;
        cardDiv.addEventListener('click', () => selectCardForTrick(card.id));
        playerHandDiv.appendChild(cardDiv);
    });
}

// Display Controls for Trick-Taking
function displayControlsForTrickTaking() {
    const controlsDiv = document.getElementById('controls');
    controlsDiv.innerHTML = '<p>Select a card from your hand to play for the trick.</p>';
}

// Select Card for Trick
function selectCardForTrick(cardId) {
    const card = getCardById(cardId, gameState.player.hand);
    if (!card) return;

    // Play the card
    gameState.trick.push({ player: 'player', card: card });
    removeCardFromHand(cardId, gameState.player.hand);
    displayGameMessage(`You played ${card.name}`);

    // Update player hand display
    displayPlayerHand();

    // AI plays a card
    aiPlayCardForTrick();
}

// AI Plays a Card for Trick
function aiPlayCardForTrick() {
    // Simple AI: plays a random card
    const aiCard = gameState.ai.hand.pop();
    gameState.trick.push({ player: 'ai', card: aiCard });
    displayGameMessage(`AI played ${aiCard.name}`);

    // Display the trick
    displayTrick();

    // Determine winner
    setTimeout(determineTrickWinner, 1000); // Delay to show the trick
}

// Display the Trick
function displayTrick() {
    const trickAreaDiv = document.getElementById('trickArea');
    trickAreaDiv.innerHTML = ''; // Clear previous trick

    gameState.trick.forEach(play => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerText = `${play.card.name}\n(${play.card.suit || play.card.type})\nPlayed by: ${play.player}`;
        trickAreaDiv.appendChild(cardDiv);
    });
}

// Determine Trick Winner
function determineTrickWinner() {
    const playerCard = gameState.trick.find(play => play.player === 'player').card;
    const aiCard = gameState.trick.find(play => play.player === 'ai').card;

    let winner = 'player';
    if (aiCard.level > playerCard.level) {
        winner = 'ai';
    } else if (aiCard.level === playerCard.level) {
        // Tie-breaker: compare stars
        if (aiCard.stars > playerCard.stars) {
            winner = 'ai';
        }
    }

    // Award Summoning Points
    const spEarned = (playerCard.stars + aiCard.stars) * 100;
    gameState[winner].summoningPoints += spEarned;

    displayGameMessage(`${winner.toUpperCase()} wins the trick and earns ${spEarned} Summoning Points!`);
    updatePlayerInfo();

    // AI Reaction
    if (winner === 'ai') {
        aiSendMessage(`I won the trick and gained ${spEarned} SP!`);
    } else {
        aiSendMessage(`You got lucky this time.`);
    }

    // Clear the trick
    gameState.trick = [];
    document.getElementById('trickArea').innerHTML = '';

    // Proceed to Summoning Phase
    setTimeout(() => {
        if (winner === 'player') {
            gameState.turn = 'player';
        } else {
            gameState.turn = 'ai';
        }
        startSummoningPhase();
    }, 2000);
}

// Start Summoning Phase
function startSummoningPhase() {
    gameState.currentPhase = 'summoningPhase';
    displayGameMessage('Starting Summoning Phase');

    if (gameState.turn === 'player') {
        displayControlsForSummoning();
    } else {
        aiSummoningPhase();
    }
}

// Display Controls for Summoning
function displayControlsForSummoning() {
    const controlsDiv = document.getElementById('controls');
    controlsDiv.innerHTML = '<p>Select a creature to summon:</p>';

    gameState.player.hand.forEach(card => {
        if (card.type === 'Trickster' || card.type === 'Taker') {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            cardDiv.innerText = `${card.name}\nLevel: ${card.level}\nSP Cost: ${card.level * 200}`;
            cardDiv.addEventListener('click', () => selectInactiveCards(card.id));
            controlsDiv.appendChild(cardDiv);
        }
    });

    // Option to skip summoning
    const skipButton = document.createElement('button');
    skipButton.innerText = 'Skip Summoning';
    skipButton.addEventListener('click', () => {
        // Proceed to Battle Phase
        startBattlePhase();
    });
    controlsDiv.appendChild(skipButton);
}

// Select Inactive Cards for Battery
function selectInactiveCards(activeCardId) {
    const activeCard = getCardById(activeCardId, gameState.player.hand);
    if (!activeCard) return;

    const controlsDiv = document.getElementById('controls');
    controlsDiv.innerHTML = '<p>Select up to 2 Inactive cards (Spells, Traps, or Creatures):</p>';

    const selectedInactiveCards = [];
    const handCopy = [...gameState.player.hand]; // To prevent mutation during iteration

    handCopy.forEach(card => {
        if (card.id !== activeCardId) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            cardDiv.innerText = `${card.name}\nType: ${card.type}`;
            cardDiv.addEventListener('click', () => {
                if (!selectedInactiveCards.includes(card) && selectedInactiveCards.length < 2) {
                    selectedInactiveCards.push(card);
                    cardDiv.style.backgroundColor = '#008080'; // Teal to indicate selection
                }
            });
            controlsDiv.appendChild(cardDiv);
        }
    });

    const confirmButton = document.createElement('button');
    confirmButton.innerText = 'Confirm Battery';
    confirmButton.addEventListener('click', () => {
        summonCreatureWithBattery(activeCardId, selectedInactiveCards);
    });
    controlsDiv.appendChild(confirmButton);
}

// Summon Creature with Battery
function summonCreatureWithBattery(activeCardId, inactiveCards) {
    const activeCard = getCardById(activeCardId, gameState.player.hand);
    if (!activeCard) return;

    const spCost = activeCard.level * 200;
    if (gameState.player.summoningPoints < spCost) {
        alert('Not enough Summoning Points!');
        return;
    }

    // Deduct SP
    gameState.player.summoningPoints -= spCost;
    updatePlayerInfo();

    // Create Battery
    const battery = {
        active: activeCard,
        inactive: inactiveCards,
    };
    gameState.player.field.push(battery);

    // Remove cards from hand
    removeCardFromHand(activeCardId, gameState.player.hand);
    inactiveCards.forEach(card => removeCardFromHand(card.id, gameState.player.hand));

    displayGameMessage(`You summoned ${activeCard.name} with ${inactiveCards.length} Inactive card(s)`);
    displayPlayerField();

    // Proceed to Battle Phase
    startBattlePhase();
}

// AI Summoning Phase
function aiSummoningPhase() {
    // Simple AI logic: Summon the strongest creature it can afford
    const affordableCreatures = gameState.ai.hand.filter(card => (card.type === 'Trickster' || card.type === 'Taker') && gameState.ai.summoningPoints >= card.level * 200);

    if (affordableCreatures.length > 0) {
        const activeCard = affordableCreatures.reduce((prev, current) => (prev.atk > current.atk ? prev : current));
        const spCost = activeCard.level * 200;
        gameState.ai.summoningPoints -= spCost;

        // Select up to 2 Inactive cards randomly
        const possibleInactiveCards = gameState.ai.hand.filter(card => card.id !== activeCard.id);
        const inactiveCards = possibleInactiveCards.slice(0, 2);

        // Create Battery
        const battery = {
            active: activeCard,
            inactive: inactiveCards,
        };
        gameState.ai.field.push(battery);

        // Remove cards from hand
        removeCardFromHand(activeCard.id, gameState.ai.hand);
        inactiveCards.forEach(card => removeCardFromHand(card.id, gameState.ai.hand));

        displayGameMessage(`AI summoned ${activeCard.name}`);
        aiSendMessage(`I summon ${activeCard.name} to the field!`);
        displayAIField();

        // Proceed to Battle Phase
        startBattlePhase();
    } else {
        // AI skips summoning
        displayGameMessage('AI skips Summoning Phase');
        aiSendMessage(`I have nothing to summon this turn.`);
        startBattlePhase();
    }
}

// Start Battle Phase
function startBattlePhase() {
    gameState.currentPhase = 'battlePhase';
    displayGameMessage('Starting Battle Phase');

    if (gameState.turn === 'player') {
        if (gameState.player.field.length > 0) {
            displayControlsForBattle();
        } else {
            // Proceed to End Phase
            startEndPhase();
        }
    } else {
        aiBattlePhase();
    }
}

// Display Controls for Battle
function displayControlsForBattle() {
    const controlsDiv = document.getElementById('controls');
    controlsDiv.innerHTML = '<p>Select a creature to attack with:</p>';

    gameState.player.field.forEach((battery, index) => {
        const card = battery.active;
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerText = `${card.name}\nATK: ${card.atk}\nDEF: ${card.def}`;
        cardDiv.addEventListener('click', () => attackWithCreature(index));
        controlsDiv.appendChild(cardDiv);
    });

    // Option to skip attacking
    const skipButton = document.createElement('button');
    skipButton.innerText = 'Skip Attack';
    skipButton.addEventListener('click', () => {
        // Proceed to End Phase
        startEndPhase();
    });
    controlsDiv.appendChild(skipButton);
}

// Attack with Creature
function attackWithCreature(batteryIndex) {
    const attackerBattery = gameState.player.field[batteryIndex];
    const attacker = attackerBattery.active;

    // Check if AI has creatures
    if (gameState.ai.field.length > 0) {
        // For simplicity, attack the first AI creature
        const defenderBattery = gameState.ai.field[0];
        const defender = defenderBattery.active;

        if (attacker.atk > defender.def) {
            // Destroy AI's creature
            destroyBattery(defenderBattery, gameState.ai);
            displayGameMessage(`You destroyed AI's ${defender.name}!`);
            aiSendMessage(`No! My ${defender.name} was destroyed!`);
        } else if (attacker.atk < defender.def) {
            // Destroy player's creature
            destroyBattery(attackerBattery, gameState.player);
            displayGameMessage(`Your ${attacker.name} was destroyed by AI's ${defender.name}!`);
            aiSendMessage(`Your ${attacker.name} couldn't stand against my ${defender.name}.`);
        } else {
            // Both are destroyed
            destroyBattery(defenderBattery, gameState.ai);
            destroyBattery(attackerBattery, gameState.player);
            displayGameMessage(`Both ${attacker.name} and ${defender.name} were destroyed!`);
            aiSendMessage(`It seems we both lost our creatures.`);
        }
    } else {
        // Direct attack
        gameState.ai.lifePoints -= attacker.atk;
        updatePlayerInfo();
        displayGameMessage(`You attacked AI directly with ${attacker.name} for ${attacker.atk} damage!`);
        aiSendMessage(`Ouch! That hit me directly.`);
    }

    displayPlayerField();
    displayAIField();

    // Proceed to End Phase
    setTimeout(startEndPhase, 2000);
}

// AI Battle Phase
function aiBattlePhase() {
    if (gameState.ai.field.length > 0) {
        const attackerBattery = gameState.ai.field[0];
        const attacker = attackerBattery.active;

        // Check if player has creatures
        if (gameState.player.field.length > 0) {
            const defenderBattery = gameState.player.field[0];
            const defender = defenderBattery.active;

            if (attacker.atk > defender.def) {
                // Destroy player's creature
                destroyBattery(defenderBattery, gameState.player);
                displayGameMessage(`AI destroyed your ${defender.name}!`);
                aiSendMessage(`My ${attacker.name} destroys your ${defender.name}!`);
            } else if (attacker.atk < defender.def) {
                // Destroy AI's creature
                destroyBattery(attackerBattery, gameState.ai);
                displayGameMessage(`Your ${defender.name} destroyed AI's ${attacker.name}!`);
                aiSendMessage(`Impossible! You defeated my ${attacker.name}!`);
            } else {
                // Both are destroyed
                destroyBattery(defenderBattery, gameState.player);
                destroyBattery(attackerBattery, gameState.ai);
                displayGameMessage(`Both ${attacker.name} and ${defender.name} were destroyed!`);
                aiSendMessage(`A draw... we both lost our creatures.`);
            }
        } else {
            // Direct attack
            gameState.player.lifePoints -= attacker.atk;
            updatePlayerInfo();
            displayGameMessage(`AI attacked you directly with ${attacker.name} for ${attacker.atk} damage!`);
            aiSendMessage(`I attack you directly with ${attacker.name}!`);
        }

        displayPlayerField();
        displayAIField();
    } else {
        displayGameMessage('AI skips Battle Phase');
        aiSendMessage(`I have no creatures to attack with this turn.`);
    }

    // Proceed to End Phase
    setTimeout(startEndPhase, 2000);
}

// Destroy Battery
function destroyBattery(battery, player) {
    // Activate Inactive cards
    battery.inactive.forEach(card => {
        activateCardEffect(card, player, getOpponent(player));
    });

    // Remove battery from field
    player.field = player.field.filter(b => b !== battery);

    // Send active card to discard pile
    player.discardPile.push(battery.active);
}

// Activate Card Effect
function activateCardEffect(card, player, opponent) {
    displayGameMessage(`${player === gameState.player ? 'You' : 'AI'} activated ${card.name}'s effect!`);

    switch (card.name) {
        case "Divine Barrier":
            // Grants temporary DEF boost of +1000 to all creatures for one turn
            player.field.forEach(battery => {
                battery.active.def += 1000;
            });
            break;
        case "Overwhelm":
            // Destroy an opponent's creature with DEF less than 2500
            const targetBattery = opponent.field.find(battery => battery.active.def < 2500);
            if (targetBattery) {
                destroyBattery(targetBattery, opponent);
                displayGameMessage(`${card.name} destroyed ${opponent === gameState.player ? 'your' : 'AI\'s'} ${targetBattery.active.name}!`);
                if (opponent === gameState.player) {
                    aiSendMessage(`My ${card.name} destroyed your ${targetBattery.active.name}!`);
                } else {
                    aiSendMessage(`Your ${card.name} destroyed my ${targetBattery.active.name}!`);
                }
            }
            break;
        // Add cases for other cards
        default:
            displayGameMessage(`${card.name} has no effect.`);
            break;
    }
}

// Start End Phase
function startEndPhase() {
    gameState.currentPhase = 'endPhase';
    displayGameMessage('Ending Turn');

    // Check for win conditions
    if (gameState.ai.lifePoints <= 0) {
        alert('You win!');
        resetGame();
    } else if (gameState.player.lifePoints <= 0) {
        alert('You lose!');
        resetGame();
    } else {
        // Switch turn
        gameState.turn = gameState.turn === 'player' ? 'ai' : 'player';

        // Start next turn
        setTimeout(startTurn, 1000);
    }
}


// Reset Game
function resetGame() {
    location.reload();
}

// Helper Functions
function getCardById(cardId, cardArray) {
    return cardArray.find(card => card.id === cardId);
}

function removeCardFromHand(cardId, hand) {
    const index = hand.findIndex(card => card.id === cardId);
    if (index !== -1) {
        hand.splice(index, 1);
    }
}

function displayPlayerField() {
    const playerFieldDiv = document.getElementById('playerField');
    playerFieldDiv.innerHTML = ''; // Clear previous field

    gameState.player.field.forEach(battery => {
        const batteryDiv = document.createElement('div');
        batteryDiv.className = 'battery';

        const activeCardDiv = document.createElement('div');
        activeCardDiv.className = 'active-card';
        activeCardDiv.innerText = `${battery.active.name}\nATK: ${battery.active.atk}\nDEF: ${battery.active.def}`;
        batteryDiv.appendChild(activeCardDiv);

        battery.inactive.forEach(card => {
            const inactiveCardDiv = document.createElement('div');
            inactiveCardDiv.className = 'inactive-card';
            inactiveCardDiv.innerText = `${card.name}\nType: ${card.type}`;
            batteryDiv.appendChild(inactiveCardDiv);
        });

        playerFieldDiv.appendChild(batteryDiv);
    });
}

function displayAIField() {
    const aiFieldDiv = document.getElementById('aiField');
    aiFieldDiv.innerHTML = ''; // Clear previous field

    gameState.ai.field.forEach(battery => {
        const batteryDiv = document.createElement('div');
        batteryDiv.className = 'battery';

        const activeCardDiv = document.createElement('div');
        activeCardDiv.className = 'active-card';
        activeCardDiv.innerText = `${battery.active.name}\nATK: ${battery.active.atk}\nDEF: ${battery.active.def}`;
        batteryDiv.appendChild(activeCardDiv);

        battery.inactive.forEach(card => {
            const inactiveCardDiv = document.createElement('div');
            inactiveCardDiv.className = 'inactive-card';
            inactiveCardDiv.innerText = `${card.name}\nType: ${card.type}`;
            batteryDiv.appendChild(inactiveCardDiv);
        });

        aiFieldDiv.appendChild(batteryDiv);
    });
}

function getOpponent(player) {
    return player === gameState.player ? gameState.ai : gameState.player;
}

// AI Chat Messages
function aiSendMessage(message) {
    const chatMessagesDiv = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'avatar';
    // You can set background image or avatar image here

    const textDiv = document.createElement('div');
    textDiv.className = 'message';
    textDiv.innerText = message;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(textDiv);

    chatMessagesDiv.appendChild(messageDiv);

    // Scroll to the bottom
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}
