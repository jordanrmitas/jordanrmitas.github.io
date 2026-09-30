const suits = ['clubs','diamonds','hearts','spades'];
const ranks = [2,3,4,5,6,7,8,9,10,'Jack','Queen','King','Ace'];

/* Chip values:
White: 1
Red: 5
Blue: 10
Green: 25
Black: 100
Purple: 500
Orange/Yellow: 1,000
*/

class Card {
    constructor(rank,suit) {
        this.rank = rank;
        this.suit = suit;
        this.name = `${rank} of ${suit}`;
        this.value = null;
        if (Number(rank)) {
            this.value = Number(rank);
        } else if (rank != 'Ace') {
            this.value = 10;
        } else {
            this.value = 11;
        }

    }
}

class Player {
    constructor(name, chips) {
        this.isPlayer = true;
        this.name = name ?? '';
        this.hand = null;
        this.chips = Number(chips) ?? 0;

        this.canSplit = false;
        this.handTotal = false;
    }
}

class Dealer {
    constructor() {
        this.isDealer = true;
        this.name = "Dealer";
        this.hand = null;
        this.handTotal = 0;
        this.canSplit = false;
    }
}

function initDeck() {
    let deck = [];
    for (s of suits) {
        for (r of ranks) {
            deck.push(new Card(r,s));
        }
    }

    return deck;
}

function shuffle(deck) {
    let l = deck.length;
    shuffledDeck = deck.slice(); //create a shallow copy so card data can be modified if necessary
    for (let i=0; i < l; i++) {
        let s = Math.floor(Math.random()*l);
        let t = shuffledDeck[s];
        shuffledDeck[s] = shuffledDeck[l-i-1];
        shuffledDeck[l-i-1] = t;
    }

    return shuffledDeck; //returns a new deck with references to original objects
}

function initPlayers(num, names) {
    let players = [];
    for (i=0; i<num; i++) {
        players.push(new Player(names[i],100));
    }

    players.push(new Dealer());

    return players;

}

function dealCards(players, deck) {
    for (p of players) {
        p.hand = [];
        p.handTotal = 0;
    }
    for (i=1; i<3; i++) {
        for (p of players) {
            p.hand.push(deck.pop());
        }
    }
    //for num + 1, pop value from drawdeck)
    //return new deck
}

function evaluateHand(player) {
    player.canSplit = (player.hand[0].rank == player.hand[1].rank);
    let total = [0];
    for (card of player.hand) {
        if (card.rank != 'Ace') {
            total[0] += card.value;
            if (total[1]) {total[1] += card.value;}
        } else {
            total[0] += card.value[0];
            total[1] += card.value[1];
        }
    }

    player.handTotal = total;
}

var newDeck = initDeck();
var genShuffle = shuffle(newDeck);
var deck = genShuffle;
var players = initPlayers(3, ['John','Sara','Tony'] )



console.table(newDeck);
console.table(deck);
console.table(players);

function displayHands(players) {
    for (p of players) {
        console.log(`${p.name}:`);
        for (card of p.hand) {
            console.log(card.name);
        }
        let total = p.handTotal[1] ? p.handTotal[0] + "or" + p.handTotal[1] : p.handTotal[0];
        console.log(String(total))
        console.log(p.canSplit);
    }
}

dealCards(players,deck);
console.table(players);
for (p of players) {
    console.table(p.hand);
    evaluateHand(p);
}
displayHands(players);


