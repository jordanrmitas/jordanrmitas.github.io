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
        this.name = (name && typeof name === "string" && name.trim()) ? name : 'Default Player'; 
        this.handTotal = false;
        this.chips = chips ?? 100;
        this.id = this.name ? this.name.trim().toLowerCase().replaceAll(" ", "-") : "default-player";
    }
}

class Dealer {
    constructor() {
        this.isDealer = true;
        this.name = "Dealer";
        this.hand = null;
        this.handTotal = 0;
        this.id = "dealer";
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

function initPlayers(num, names, chips) {
    let players = [];
    for (i=0; i<num; i++) {
        if (!names) {
            players.push(new Player(`Player ${i+1}`, chips));
        } else {
            players.push(new Player(names[i], chips));
        }
    }

    players.push(new Dealer());

    return players;

}

function initializePlayers(n) {
    const players = initPlayers(n);
    clearAllData(players);

    return players
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

function clearAllData(players) {
    for (p of players) {
        clearData(p);
    }
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

    for (p of players) {
        evaluateHand(p);
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


//HTML stuff

function displayHand(player) {
    const p = document.getElementById(`player-${player.id}`);
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

function displayAllHands(players) {
    for (player of players) {
        displayHand(player);
    }
}

/*document.getElementById("deal-button").addEventListener("click", function () {
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
}) */


////////////////////////////////////////////////////////////////////HTML Functions////////////////////////////////////////////////////////////////////

function createPlayerElt(player) {
    const p = document.createElement("div");
    p.id = `player-${player.id}`;

    const nameDisplay = document.createElement("h2");
    nameDisplay.id = "player-name";
    nameDisplay.innerText = player.name;

    const playerHand = document.createElement("div");
    playerHand.id = "player-hand";
    playerHand.classList.add("hand");

    const scoreDisplay = document.createElement("p");
    scoreDisplay.innerHTML = `Total: <span id="player-hand-total" class="score">${player.handTotal}</span>`;

    p.appendChild(nameDisplay);
    p.appendChild(playerHand);
    p.appendChild(scoreDisplay);
    
    return p;
}

function createDealerElt(dealer) {
    const d = document.createElement("div");
    d.id = `player-${dealer.id}`;

    const nameDisplay = document.createElement("h2");
    nameDisplay.id = "dealer-name";
    nameDisplay.innerText = dealer.name;

    const dealerHand = document.createElement("div");
    dealerHand.id = "dealer-hand";
    dealerHand.classList.add("hand");

    const scoreDisplay = document.createElement("p");
    scoreDisplay.innerHTML = `Total: <span id="dealer-hand-total" class="score">${dealer.handTotal}</span>`;

    d.appendChild(nameDisplay);
    d.appendChild(dealerHand);
    d.appendChild(scoreDisplay);
    
    return d;
}

function initializeGameElts(players) {
    const playerEnv = document.getElementById("players");
    const dealerEnv = document.getElementById("dealer");

    for (p of players) {
        if (!p.isDealer) {
            pElt = createPlayerElt(p);
            playerEnv.appendChild(pElt);
        } else {
            dElt = createDealerElt(p);
            dealerEnv.appendChild(dElt);
        }
    }
}

const form1 = document.getElementById("initial-form")
const playerNumInput = document.getElementById("number-of-players");

form1.addEventListener("submit", function(event) {
    event.preventDefault();
    const playerNum = parseInt(playerNumInput.value);
    const players = initializePlayers(playerNum);
    const deck = doubleShuffle(initDeck(2));
    initializeGameElts(players);

    const setup = document.getElementById("setup-env");
    const game = document.getElementById("game-env");
    setup.hidden = true;
    game.hidden = false;

    dealCards(players,deck);
    displayAllHands(players);


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
