// Získání odkazů na HTML elementy
const gameBoard = document.getElementById('game-board'); // Herní plocha
const player1ScoreSpan = document.getElementById('player1-score'); // Zobrazení skóre hráče 1
const player2ScoreSpan = document.getElementById('player2-score'); // Zobrazení skóre hráče 2
const player1NameDisplay = document.getElementById('player1-name-display');
const player2NameDisplay = document.getElementById('player2-name-display');
const currentPlayerDisplay = document.getElementById('current-player-display');
const startButton = document.getElementById('start-button'); // Tlačítko Spustit hru
const resetButton = document.getElementById('reset-button'); // Tlačítko Nová hra
const pauseButton = document.getElementById('pause-button'); // Tlačítko Pauza/Pokračovat
const pauseOverlay = document.getElementById('pause-overlay'); // Overlay pro pauzu
const gameContainer = document.getElementById('game-container');
const gameInfo = document.getElementById('game-info');
const mainGameArea = document.getElementById('main-game-area')
const pairSelectionContainer = document.getElementById('pair-selection-container');
const numPairsInput = document.getElementById('num-pairs-input');
const pairErrorMessage = document.getElementById('pair-error-message');
const endGameMessageContainer = document.getElementById('end-game-message-container'); 
const endGameMessageText = document.getElementById('end-game-message-text');     
const themeSelection = document.getElementById('theme-selection');

//jméno hráčů
const player1NameInput = document.getElementById('player1-name-input');
const player2NameInput = document.getElementById('player2-name-input');

// Funkce: Generuje pole cest k obrázkům pro karty
function generateCardValues(themeFolder, numberOfUniqueImages, fileExtension) {
    const values = [];
    // Vytvoříme základní cestu k obrázkům včetně složky tématu
    const baseImagePathPrefix = `images/${themeFolder}/`;
    for (let i = 1; i <= numberOfUniqueImages; i++) {
        const imagePath = `${baseImagePathPrefix}${i}${fileExtension}`;
        values.push(imagePath);
        values.push(imagePath); // Každý obrázek přidáme dvakrát pro pár
    }
    return values;
}

// Proměnná pro uložení skutečných hodnot karet, bude naplněna po výběru uživatele
let cardValues = [];

// Cesta k obrázku pro PŘEDNÍ STRANU (rub) všech karet
const cardBackImage = 'background/ZStr.jpg';

// Proměnné pro stav hry
let shuffledCards = [];
let flippedCards = [];
let matchedPairs = 0;
let player1Score = 0;
let player2Score = 0;
let currentPlayer = 1;
let lockBoard = false;
let isPaused = false;
let player1Name = "Hráč 1";
let player2Name = "Hráč 2";


// Funkce pro promíchání pole (Fisher-Yates algoritmus)
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

// Funkce pro vytvoření herního pole (SPUŠTĚNÍ HRY) - nyní volána z startGame()
function createBoard() {
    // Vynulování skóre a stavu hry
    player1Score = 0;
    player2Score = 0;
    matchedPairs = 0;
    currentPlayer = 1;
    isPaused = false; // Reset stavu pauzy
    lockBoard = false; // Odemknout desku na začátku nové hry

    player1ScoreSpan.textContent = player1Score;
    player2ScoreSpan.textContent = player2Score;
    // Používáme jména hráčů pro zobrazení aktuálního hráče
    currentPlayerDisplay.textContent = player1Name; // Začíná hráč 1
    player1NameDisplay.textContent = player1Name;
    player2NameDisplay.textContent = player2Name;
    gameBoard.innerHTML = ''; // Vyprázdní herní plochu
    pauseOverlay.classList.add('hidden'); // Skryje overlay pauzy

    // Zobrazí tlačítko "Pauza" a skryje "Nová hra"
    pauseButton.classList.remove('hidden');
    resetButton.classList.add('hidden');
    pauseButton.textContent = 'Pauza'; // Nastaví text tlačítka na "Pauza"

    // Promícháme karty
    shuffledCards = shuffle([...cardValues]);

    // Vytvoříme HTML elementy pro každou kartu
    shuffledCards.forEach((imagePath, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = imagePath;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-front">
                <img src="${cardBackImage}" alt="Rub karty" class="card-image-front" onerror="this.onerror=null;this.src='https://placehold.co/100x100/CCCCCC/000000?text=CHYBA+OBR%C3%81ZKU';">
            </div>
            <div class="card-back">
                <img src="${imagePath}" alt="Pexeso karta" class="card-image-back" onerror="this.onerror=null;this.src='https://placehold.co/100x100/EEEEEE/000000?text=CHYBA+OBR%C3%81ZKU';">
            </div>
        `;
        
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

// Funkce pro otočení karty
function flipCard() {
    if (lockBoard || isPaused || this.classList.contains('flipped') || this.classList.contains('matched')) {
        return;
    }

    this.classList.add('flipped');

    flippedCards.push(this);

    if (flippedCards.length === 2) {
        lockBoard = true;
        setTimeout(checkForMatch, 1000);
    }
}

// Funkce pro kontrolu shody karet
function checkForMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.value === card2.dataset.value) {
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
}

// Funkce pro resetování otočených karet a odemčení desky
function resetFlippedCards() {
    flippedCards = [];
    lockBoard = false;
}

// Funkce pro přepnutí hráče
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentPlayerDisplay.textContent = currentPlayer === 1 ? player1Name : player2Name;
}


// Funkce pro konec hry (volá se po dokončení všech párů)
// Funkce pro konec hry (volá se po dokončení všech párů)
function endGame() {
    let winnerMessage = '';
    if (player1Score > player2Score) {
        winnerMessage = `${player1Name} vyhrál!`; // Používá jméno hráče 1
    } else if (player2Score > player1Score) {
        winnerMessage = `${player2Name} vyhrál!`; // Používá jméno hráče 2
    } else {
        winnerMessage = 'Remíza!';
    }
    
    endGameMessageText.textContent = `Hra skončila!\n${winnerMessage}\nNalezeno ${matchedPairs} párů. Chcete hrát znovu?`;
    endGameMessageContainer.classList.remove('hidden');
    resetButton.classList.remove('hidden'); 
    console.log("Konec hry. Kontejner se zprávou a tlačítko 'Nová hra' jsou viditelné.");

    mainGameArea.classList.add('hidden');
    pauseButton.classList.add('hidden');
    gameBoard.innerHTML = '';
}

// Funkce pro pozastavení/spuštění hry
function togglePause() {
    isPaused = !isPaused; // Přepne stav pauzy
    lockBoard = isPaused; // Zamkne desku, pokud je hra pozastavena

    if (isPaused) {
        pauseButton.textContent = 'Pokračovat'; // Změní text tlačítka
        pauseOverlay.classList.remove('hidden'); // Zobrazí overlay
    } else {
        pauseButton.textContent = 'Pauza'; // Změní text tlačítka
        pauseOverlay.classList.add('hidden'); // Skryje overlay
    }
}

// Funkce: Resetuje hru do počátečního stavu (výběr počtu párů)
function resetGameToInitialState() {
    console.log("Tlačítko 'Nová hra' bylo kliknuto. Resetuji hru do počátečního stavu.");
    gameBoard.innerHTML = '';
    player1Score = 0;
    player2Score = 0;
    player1ScoreSpan.textContent = player1Score;
    player2ScoreSpan.textContent = player2Score;
    player1NameDisplay.textContent = "Hráč 1";
    player2NameDisplay.textContent = "Hráč 2";
    currentPlayerDisplay.textContent = "Hráč 1"; // Výchozí text
    player1NameInput.value = "";
    player2NameInput.value = "";

    pauseOverlay.classList.add('hidden');
    isPaused = false;

    // Skryje herní UI a zprávu o konci hry, zobrazí výběr počtu párů a tématu
    mainGameArea.classList.add('hidden');
    pauseButton.classList.add('hidden');
    endGameMessageContainer.classList.add('hidden');
    resetButton.classList.add('hidden'); 

    pairSelectionContainer.classList.remove('hidden'); // Zobrazí kontejner pro výběr párů
    startButton.classList.remove('hidden'); // Zobrazí tlačítko Spustit hru
    pairErrorMessage.classList.add('hidden'); // Skryje chybovou zprávu
}

// Funkce: Spustí hru s vybraným počtem párů
function startGame() {
    const numPairs = parseInt(numPairsInput.value);
    const maxUniqueImages = 20;
    const minUniqueImages = 4;

    // Validace vstupu (beze změny)
    if (isNaN(numPairs) || numPairs < minUniqueImages || numPairs > maxUniqueImages) {
        pairErrorMessage.classList.remove('hidden');
        console.log("Neplatný počet párů: " + numPairs);
        return;
    } else {
        pairErrorMessage.classList.add('hidden');
    }

    player1Name = player1NameInput.value.trim();
    player2Name = player2NameInput.value.trim();

    // Pokud jméno není zadáno, použijeme výchozí "Hráč 1" / "Hráč 2"
    if (player1Name === "") {
        player1Name = "Hráč 1";
    }
    if (player2Name === "") {
        player2Name = "Hráč 2";
    }
  
    const selectedThemeRadio = document.querySelector('input[name="theme"]:checked');
    // Pokud nic není vybráno, nastavíme výchozí téma na 'fruits'
    const selectedTheme = selectedThemeRadio ? selectedThemeRadio.value : 'fruits'; 
    console.log("Vybrané téma: " + selectedTheme); // Diagnostická zpráva

    cardValues = generateCardValues(selectedTheme, numPairs, '.jpg');
    console.log("Generované cesty k obrázkům (cardValues):", cardValues);

    // Skryje výběr párů a zobrazí herní UI (beze změny)
    pairSelectionContainer.classList.add('hidden');
    mainGameArea.classList.remove('hidden');
    console.log("pairSelectionContainer skryt, mainGameArea by měl být viditelný.");

    createBoard(); // Spustí hru s vygenerovanými kartami
}


// Posluchače událostí pro tlačítka
startButton.addEventListener('click', startGame); // Tlačítko "Spustit hru" nyní spouští hru
resetButton.addEventListener('click', resetGameToInitialState); // Tlačítko "Nová hra" volá resetGameToInitialState
pauseButton.addEventListener('click', togglePause); // Pauza/Pokračovat

// Inicializace: Skryjeme herní UI a zobrazíme pouze výběr počtu párů
document.addEventListener('DOMContentLoaded', () => {
    resetGameToInitialState(); // Používá novou funkci pro inicializaci
});