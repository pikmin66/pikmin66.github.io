const fs = require('fs');

// Load existing cards.json
let rawData = fs.readFileSync('cards.json');
let cards = JSON.parse(rawData);

// Define Trump suitRanks
const takers = [
    'Q♣', 'Q♠', 'Q♥', 'Q♦',
    'J♣', 'J♠', 'J♥', 'J♦',
    'A♦', '10♦', 'K♦', '9♦', '8♦', '7♦'
];

// Define Tricksters as non-trump Aces, Tens, Kings, Nines, Eights, Sevens
const ranks = ['A', '10', 'K', '9', '8', '7'];

// Function to get suit symbol
function getSuitSymbol(suit) {
    const symbols = {
        'Hearts': '♥',
        'Diamonds': '♦',
        'Clubs': '♣',
        'Spades': '♠',
        'Unknown': 'Unknown'
    };
    return symbols[suit] || 'Unknown';
}

// Update each card
cards.forEach(card => {
    if (card.suit && card.rank) { // It's a creature card
        // Create suitRank
        card.suitRank = `${card.rank.charAt(0)}${getSuitSymbol(card.suit)}`;
        
        // Assign type
        if (takers.includes(card.suitRank)) {
            card.type = 'Taker';
        } else if (ranks.includes(card.rank)) {
            card.type = 'Trickster';
        } else {
            card.type = 'Trickster'; // Default to Trickster if not specified
        }
    }
});

// Write updated cards back to cards.json
fs.writeFileSync('cards.json', JSON.stringify(cards, null, 4));

console.log('cards.json has been updated with suitRank and type.');
