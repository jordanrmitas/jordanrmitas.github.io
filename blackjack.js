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


//Initializing data

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
        this.handTotal = false;
        this.chips = chips ?? 100;
    }
}

class Dealer {
    constructor() {
        this.isDealer = true;
        this.name = "Dealer";
        this.hand = null;
        this.handTotal = 0;
    }
}

function initDeck(num) {
    let deck = [];
    const numOfDecks = num ?? 1;
    for (let i=1; i <= numOfDecks; i++) {
        for (s of suits) {
            for (r of ranks) {
                deck.push(new Card(r,s));
            }
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

function doubleShuffle(deck) {
    d = shuffle(deck);
    let l = d.length;
    let newD = [];
    for (i=0; i < l; i++) {
        newD.push(d.pop());
    }
    finalD = shuffle(newD);

    return finalD;
}

function initPlayers(num, names) {
    let players = [];
    for (i=0; i<num; i++) {
        players.push(new Player(names[i],100));
    }

    players.push(new Dealer());

    return players;

}

//Beginning the round

function clearData(p) {
    p.hand = [];
    p.handTotal = 0;
    p.isDone = false;
    p.busted = false;
    p.hasBlackjack = false; 
    p.wager = 0;  
    p.winnings = 0;
}


function dealCards(players, deck) {
    for (p of players) {
        clearData(p);
    }
    for (i=1; i<3; i++) {
        for (p of players) {
            p.hand.push(deck.pop());
        }
    }
}

function evaluateHand(player) {
    player.canSplit = (!player.isDealer && player.hand[0].rank == player.hand[1].rank);
    let total = 0;
    for (const card of player.hand) {
        if (card.rank !== 'Ace') {
            total += card.value;
        } else {
            if (total + 11 > 21) {
                total += 1;
            } else {
                total += 11;
            }
        }
    }

    if (total == 21) {
        player.hasBlackjack = true;
    }
    player.handTotal = total;

}

function updateHandEval(player) {
    let aceNum = 0;
    let total = 0;
    
    for (const card of player.hand) {
        if (card.rank == "Ace") {
            aceNum += 1;
        } else {
            total += card.value;
        }   
    }

    if (aceNum > 1) {
        if (total + aceNum + 10 > 21) {
            total += aceNum;
        } else {
            total += aceNum + 10;
        }
    } else if (aceNum > 0) {
        if (total + 11 > 21) {
            total += 1;
        } else {
            total += 11;
        }
    }

    if (total > 21) {
        player.busted = true;
    }

    player.handTotal = total;
}


//Player actions

function wager(player,chips) {
    if (chips > player.chips || chips < 1) {
        return
    } else {
        player.chips -= chips;
        player.wager = chips;
    }
}

function hitMe(player) {
    player.hand.push(deck.pop());
    updateHandEval(player);
}

function stand(player) {
    player.isDone = true;
}

function dealerTurn(dealer) {
    while (dealer.handTotal < 17) {
        hitMe(dealer);
    }
}

//End of round

function winnings(player, dealer) {
    if (player.busted) {
        player.winnings = 0;
        player.wager = 0;
    } else if (dealer.hasBlackjack) {
        if (player.hasBlackjack) {
            player.winnings = 0;
        } else {
            player.winnings = 0;
            player.wager = 0;
        }
    } else {
        if (player.hasBlackjack) {
            player.winnings = Math.ceil(1.5*player.wager);
        } else if (player.handTotal > dealer.handTotal) {
            player.winnings = player.wager;
        } else if (player.handTotal == dealer.handTotal) {
            player.winnings = 0;
        } else {
            player.winnings = 0;
            player.wager = 0;
        }
    }
}

//Game Loop

/*function displayHands(players) {
    for (p of players) {
        console.log(`${p.name}:`);
        for (card of p.hand) {
            console.log(card.name);
        }
        if (p.handTotal > 21) {
            console.log("Busted.")
        } else {
            console.log(p.handTotal)
        }
        //console.log(p.canSplit);
    }
} */

var newDeck = initDeck(2);
var deck = doubleShuffle(newDeck);
var players = initPlayers(1, ['Jordan'])

const player1 = document.getElementById("player-name");
player1.innerHTML = players[0].name;



//HTML stuff

function displayHand(player) {
    const p = document.getElementById(player.name);
    const handElt = p.querySelector(".hand");
    handElt.innerHTML = '';
    const score = p.querySelector(".score");
    score.innerHTML = player.handTotal;

    for (const card of player.hand) {
        const cardElt = document.createElement("div");
        cardElt.classList.add("card");
        cardElt.textContent = card.name;

        handElt.appendChild(cardElt);
    }

}

document.getElementById("deal-button").addEventListener("click", function () {
    dealCards(players,deck);
    for (const p of players) {
        evaluateHand(p);
    }
    displayHand(players[0]);
    displayHand(players[1]);
})

document.getElementById("hit-button").addEventListener("click", function () {
    hitMe(players[0]);
    displayHand(players[0]);
})

document.getElementById("stand-button").addEventListener("click", function () {
    dealerTurn(players[1]);
    displayHand(players[1]);
})
//dealCards(players,deck);


/*
//console.table(newDeck);
//console.table(deck);
//console.table(players);


dealCards(players,deck);
//console.table(players);

for (p of players) {
    console.table(p.hand);
    evaluateHand(p);
}
displayHands(players);

for (p of players) {
    if (!p.isDealer) {
        hitMe(p);
        updateHandEval(p);
    } else {
        dealerTurn(p);
    }
}

displayHands(players);
*/
