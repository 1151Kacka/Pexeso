// Získání odkazů na HTML elementy
const gameBoard = document.getElementById('game-board'); // Herní plocha
const player1ScoreSpan = document.getElementById('player1-score'); // Zobrazení skóre hráče 1
const player2ScoreSpan = document.getElementById('player2-score'); // Zobrazení skóre hráče 2
const currentPlayerSpan = document.getElementById('current-player'); // Zobrazení aktuálního hráče
const startButton = document.getElementById('start-button'); // Tlačítko Spustit hru
const resetButton = document.getElementById('reset-button'); // Tlačítko Nová hra
const pauseButton = document.getElementById('pause-button'); // Tlačítko Pauza/Pokračovat
const pauseOverlay = document.getElementById('pause-overlay'); // Overlay pro pauzu

// Odkazy na elementy pro zobrazení faktu a spinner
const funFactDisplay = document.getElementById('fun-fact-display');
const funFactText = document.getElementById('fun-fact-text');
const loadingSpinner = document.getElementById('loading-spinner');

// Pole s obrázky
const cardValues = [
    'images/1.jpg', 
    'images/1.jpg', 
    'images/2.jpg',
    'images/2.jpg',
    'images/3.jpg',
    'images/3.jpg',
    'images/4.jpg',
    'images/4.jpg',
    'images/5.jpg',
    'images/5.jpg',
    'images/6.jpg',
    'images/6.jpg',
    'images/7.jpg',
    'images/7.jpg',
    'images/8.jpg',
    'images/8.jpg',
    'images/9.jpg',
    'images/9.jpg',
    'images/10.jpg',
    'images/10.jpg',
    'images/11.jpg',
    'images/11.jpg',
    'images/12.jpg',
    'images/12.jpg'];
//ZAdní strana karet
const cardBackImage = 'images/ZStr.jpg';
// Proměnné pro stav hry
let shuffledCards = []; // Promícháné karty
let flippedCards = []; // Pole pro uložení právě otočených karet (max. 2)
let matchedPairs = 0; // Počet nalezených párů
let player1Score = 0; // Skóre hráče 1
let player2Score = 0; // Skóre hráče 2
let currentPlayer = 1; // Aktuální hráč (1 nebo 2)
let lockBoard = false; // Zabrání otáčení dalších karet, dokud se nezpracují dvě otočené karty
let isPaused = false; // Proměnná pro stav pauzy

// Funkce pro promíchání pole (Fisher-Yates algoritmus)
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // Dokud zbývají prvky k promíchání...
    while (currentIndex !== 0) {
        // Vyber zbývající prvek...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // A prohoď ho se současným prvkem.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Funkce pro vytvoření herního pole
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
    currentPlayerSpan.textContent = `Hráč ${currentPlayer}`;
    gameBoard.innerHTML = ''; // Vyprázdní herní plochu
    pauseOverlay.classList.add('hidden'); // Skryje overlay pauzy
    // Skryje displej faktu a spinner na začátku nové hry
    funFactDisplay.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    funFactText.textContent = ''; // Vyčistí text faktu

    // Skryje tlačítko "Start" a "Nová hra", zobrazí tlačítko "Pauza"
    startButton.classList.add('hidden');
    resetButton.classList.add('hidden');
    pauseButton.classList.remove('hidden');
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
            <div class="card-inner">
                <div class="card-front">
                    <img src="${cardBackImage}" alt="Rub karty" class="card-image-front">
                </div>
                <div class="card-back">
                    <img src="${imagePath}" alt="Pexeso karta" class="card-image-back">
                </div>
            </div>
        `;
        
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
}

// Funkce pro otočení karty
function flipCard() {
    // Pokud je zamčená deska, hra je pozastavena, nebo karta je již otočená/spárovaná, nedělej nic
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

        // Pokud se karty shodují, zobraz zajímavý fakt
        // Získá "apple" z "images/apple.jpg" pro použití v promptu pro AI
        const cardTopic = card1.dataset.value.split('/').pop().split('.')[0];
        displayFunFact(cardTopic);

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
    currentPlayerSpan.textContent = `Hráč ${currentPlayer}`;
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
    // Používáme alert pro jednoduchost, v reálné aplikaci by se použil custom modal
    alert(`Hra skončila!\n${winnerMessage}\nNalezeno ${matchedPairs} párů.`);

    resetButton.classList.remove('hidden');
    pauseButton.classList.add('hidden');
    gameBoard.innerHTML = ''; // Vyčistí desku po skončení hry
    // Skryje displej faktu na konci hry
    funFactDisplay.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
}

// Funkce pro pozastavení/spuštění hry
function togglePause() {
    isPaused = !isPaused; // Přepne stav pauzy
    lockBoard = isPaused; // Zamkne desku, pokud je hra pozastavena

    if (isPaused) {
        pauseButton.textContent = 'Pokračovat'; // Změní text tlačítka
        pauseOverlay.classList.remove('hidden'); // Zobrazí overlay
        // Skryje displej faktu, když je hra pozastavena
        funFactDisplay.classList.add('hidden');
    } else {
        pauseButton.textContent = 'Pauza'; // Změní text tlačítka
        pauseOverlay.classList.add('hidden'); // Skryje overlay
    }
}

// Funkce: Zobrazí zajímavý fakt pomocí Gemini API
async function displayFunFact(topic) {
    funFactText.textContent = ''; // Vyčistí předchozí fakt
    funFactDisplay.classList.remove('hidden'); // Zobrazí kontejner faktu
    loadingSpinner.classList.remove('hidden'); // Zobrazí spinner

    try {
        const prompt = `Napiš jednu krátkou a zajímavou fakt o: ${topic}. Odpověz pouze fakt, bez úvodu a závěru.`;
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""; // API klíč bude automaticky poskytnut v runtime
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const fact = result.candidates[0].content.parts[0].text;
            funFactText.textContent = fact;
        } else {
            funFactText.textContent = "Nepodařilo se získat zajímavý fakt.";
        }
    } catch (error) {
        console.error("Chyba při získávání faktu z Gemini API:", error);
        funFactText.textContent = "Chyba při načítání faktu.";
    } finally {
        loadingSpinner.classList.add('hidden'); // Skryje spinner
        // Skryje fakt po 5 sekundách
        setTimeout(() => {
            funFactDisplay.classList.add('hidden');
            funFactText.textContent = '';
        }, 5000);
    }
}

// Posluchače událostí pro tlačítka
startButton.addEventListener('click', createBoard); // Spustí hru
resetButton.addEventListener('click', () => { // Nová hra - po kliknutí se hra resetuje a zobrazí se tlačítko "Spustit hru"
    resetButton.classList.add('hidden'); // Skryje tlačítko Nová hra
    startButton.classList.remove('hidden'); // Zobrazí tlačítko Start
    // Vyčistí desku a resetuje skóre, ale nezačne hru hned
    gameBoard.innerHTML = '';
    player1Score = 0;
    player2Score = 0;
    player1ScoreSpan.textContent = player1Score;
    player2ScoreSpan.textContent = player2Score;
    currentPlayerSpan.textContent = `Hráč 1`;
    // Skryje displej faktu při resetu
    funFactDisplay.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    funFactText.textContent = '';
});
pauseButton.addEventListener('click', togglePause); // Pauza/Pokračovat

// Inicializace: Skryjeme herní desku a zobrazíme pouze tlačítko "Spustit hru"
// Toto je voláno pouze jednou při načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    gameBoard.innerHTML = ''; // Zajistí, že deska je prázdná na začátku
    startButton.classList.remove('hidden'); // Zobrazí tlačítko Start
    resetButton.classList.add('hidden'); // Skryje tlačítko Nová hra
    pauseButton.classList.add('hidden'); // Skryje tlačítko Pauza
    pauseOverlay.classList.add('hidden'); // Skryje overlay
    // Skryje displej faktu při inicializaci
    funFactDisplay.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    funFactText.textContent = '';
});