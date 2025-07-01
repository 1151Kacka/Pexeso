// Získání odkazů na HTML elementy
const gameBoard = document.getElementById('game-board'); // Herní plocha
const player1ScoreSpan = document.getElementById('player1-score'); // Zobrazení skóre hráče 1
const player2ScoreSpan = document.getElementById('player2-score'); // Zobrazení skóre hráče 2
const currentPlayerSpan = document.getElementById('current-player'); // Zobrazení aktuálního hráče
const resetButton = document.getElementById('reset-button'); // Tlačítko pro novou hru

// Pole s obrázky
const cardValues = [images/1, images/1, images/2,images/2,images/3,images/3,images/4,images/4,images/5,images/5,images/6,images/6,images/7,images/7,images/8,images/8,images/9,images/9,images/10,images/10,images/11,images/11,images/12,images/12];

// Proměnné pro stav hry
let shuffledCards = []; // zamíchání
let flippedCards = []; // Pole pro uložení právě otočených karet (max. 2)
let matchedPairs = 0; // Počet nalezených párů
let player1Score = 0; // Skóre hráče 1
let player2Score = 0; // Skóre hráče 2
let currentPlayer = 1; // Aktuální hráč (1 nebo 2)
let lockBoard = false; // Zabrání otáčení dalších karet, dokud se nezpracují dvě otočené karty

function createBoard() {
    // Vynulování skóre a stavu hry
    player1Score = 0;
    player2Score = 0;
    matchedPairs = 0;
    currentPlayer = 1;
    player1ScoreSpan.textContent = player1Score;
    player2ScoreSpan.textContent = player2Score;
    currentPlayerSpan.textContent = `Hráč ${currentPlayer}`;
    gameBoard.innerHTML = ''; // Vyprázdní herní plochu

    // Promícháme karty
    shuffledCards = shuffle([...cardValues]);

    // Vytvoříme HTML elementy pro každou kartu
    shuffledCards.forEach((imagePath, index) => { 
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = imagePath;
        card.dataset.index = index;

        // Vytvoření vnitřních stran karty
        // Rub karty zůstává '?', líc karty nyní zobrazuje obrázek
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div> <!-- Rub karty -->
                <!-- Líc karty nyní obsahuje obrázek -->
                <div class="card-back">
                    <img src="${imagePath}" alt="Pexeso karta" class="card-image">
                </div>
            </div>
        `;
        
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}
// zamíchání karet
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Funkce pro otočení karty
function flipCard() {
    // Pokud je zamčená deska nebo karta je již otočená nebo spárovaná, nedělej nic
    if (lockBoard || this.classList.contains('flipped') || this.classList.contains('matched')) {
        return;
    }

    this.classList.add('flipped'); // Přidá třídu 'flipped' pro otočení karty

    flippedCards.push(this); // Přidá otočenou kartu do pole

    // Pokud jsou otočené dvě karty
    if (flippedCards.length === 2) {
        lockBoard = true; // Zamkne desku, aby se nedalo klikat dál
        setTimeout(checkForMatch, 1000); // Počká 1 sekundu a zkontroluje shodu
    }
}

// Funkce pro kontrolu shody karetfunction checkForMatch() {
const [card1, card2] = flippedCards;
    if (card1.dataset.value === card2.dataset.value) { // Porovnání cest k obrázkům
        matchedPairs++;
        card1.classList.add('matched');
        card2.classList.add('matched');

        if (currentPlayer === 1) {
            player1Score++;
            player1ScoreSpan.textContent = player1Score;
        } else {
            player2Score++;
            player2ScoreSpan.textContent = player2Score;
        }

        if (matchedPairs === cardValues.length / 2) {
            setTimeout(endGame, 500);
        }
        resetFlippedCards();
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            resetFlippedCards();
            switchPlayer();
        }, 1000);
    }

// Funkce pro resetování otočených karet a odemčení desky
function resetFlippedCards() {
    flippedCards = []; // Vyprázdní pole otočených karet
    lockBoard = false; // Odemkne desku
}

// Funkce pro přepnutí hráče
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1; // Přepne mezi 1 a 2
    currentPlayerSpan.textContent = `Hráč ${currentPlayer}`; // Aktualizuje zobrazení aktuálního hráče
}

// Funkce pro konec hry
function endGame() {
    let winnerMessage = '';
    if (player1Score > player2Score) {
        winnerMessage = 'Hráč 1 vyhrál!';
    } else if (player2Score > player1Score) {
        winnerMessage = 'Hráč 2 vyhrál!';
    } else {
        winnerMessage = 'Remíza!';
    }
    alert(`Hra skončila!\n${winnerMessage}\nNalezeno ${matchedPairs} párů.`);
}

// Posluchač události pro tlačítko "Nová hra"
resetButton.addEventListener('click', createBoard);

// Inicializace hry při načtení stránky
createBoard();