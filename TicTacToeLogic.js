/* Ideen:
 Spieloption: mensch vs mensch (online) implementieren (optional).
 Namen eingeben (Leicht).
 Wählen und abwählen (Optional).
 Wählbare Sprachen (Optional).
 Modularisieren (Schwer).
 Wenn im Hauptmenü nichts ausgewählt wird,
 müssen die Buttons Rot angezeigt werden als Fehlschlag (leicht-mittel). fast erledigt.
 Globale Variablen verringern. (Mittel)
 */

// Globale Variablen
let playVersusButtons = document.querySelectorAll('.mode-button');
let difficultyButtons = document.querySelectorAll('.difficulty-button');
let symbolButtons = document.querySelectorAll('.symbol-button');
let playButton = document.querySelector('.play-button');
let gameContainer = document.querySelector('.game-container');
let modeContainer = document.querySelector('.mode-container');
let difficultyContainer = document.querySelector('.difficulty-container');
let menuButton = document.querySelector('.menu-button');
let gameRunning = false;
let clickedButtonContainer;
const delays = {
    botPlayDelay: 400,
    playDelay: 350,
};
let player1Name = "Player 1";
let player2Name = "Player 2";

// Event-Listener hinzufügen
attachClickEventListeners(playVersusButtons);
attachClickEventListeners(difficultyButtons);
attachClickEventListeners(symbolButtons);
playButton.addEventListener('click', handlePlayButtonClick);

// Spielvariablen
let player;
const cellElements = document.querySelectorAll(".cell");
const statusText = document.querySelector(".status-text");
// Fehler-Text-Element abrufen
let errorText = document.getElementById('error-text');
let scoresText = document.querySelector(".scores-container");
const restartButton = document.querySelector(".restart-button");
let humanTurn = null;
let currentPlayer = null;
let result;
let combinationArray = [];
let BOARD = ["", "", "", "", "", "", "", "", ""];
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Punktesystem für die Spieler
let playerScores = {
    X: 0,
    O: 0,
    Tie: 0,
};

// Event Listener für Restart Button
restartButton.addEventListener("click", resetGame);

// Funktion zum Zurücksetzen der Spielerpunkte
function resetScores() {
    playerScores = {
        X: 0,
        O: 0,
        Tie: 0,
    };
    updatePlayerScores(""); // Leerer String, um den Text zu aktualisieren
}

// Funktion, um die Spieler-Namen zu aktualisieren
function updatePlayerNames() {
    // Spieler-Namen aus den Eingabefeldern abrufen
    player1Name = document.getElementById('player1').value || "Player 1";
    player2Name = document.getElementById('player2').value || "Player 2";

    // Namen im Spiel anzeigen (zum Beispiel im Status-Text)
    document.querySelector('.status-text').innerText = `${player1Name} vs ${player2Name}`;
}

// Event-Listener für die "Human"-Schaltfläche hinzufügen
document.getElementById('human').addEventListener('click', function() {
    // Eingabefelder für Spieler-Namen einblenden
    document.querySelector('.player-names-container').style.display = 'block';
});

// Event-Listener für die Spielmodus-Buttons hinzufügen
document.getElementById('human').addEventListener('click', function() {
    // Human-Modus ausgewählt: Namenscontainer anzeigen
    document.getElementById('playerNamesContainer').style.display = 'block';
});

document.getElementById('computer').addEventListener('click', function() {
    // Computer-Modus ausgewählt: Namenscontainer ausblenden
    document.getElementById('playerNamesContainer').style.display = 'none';
});


// Event-Listener für den "Play"-Button hinzufügen
document.querySelector('.play-button').addEventListener('click', function() {
    // Vor dem Spielstart die Spieler-Namen speichern
    updatePlayerNames();
});



// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    // Spielvariablen zurücksetzen
    humanTurn = null;
    currentPlayer = null;
    result = "";
    combinationArray = [];
    BOARD = ["", "", "", "", "", "", "", "", ""];

    // Zellenanzeige und Klassen zurücksetzen
    cellElements.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('winner');
    });

    // Klick-Ereignisse während des Resets deaktivieren
    toggleCellClickListeners(false);

    // Klick-Ereignisse nach einer kurzen Verzögerung wieder aktivieren
    setTimeout(() => {
        toggleCellClickListeners(true);
    }, delays.playDelay);

    // Spiel neu starten
    startGame();
}

// Funktion zum Starten des Spiels
function startGame() {
    gameRunning = false;
    humanTurn = determineStartingPlayer();
    result = "";
    currentPlayer = humanTurn ? player[0] : player[1];
    runGame();
}

// Funktion zum Bestimmen des startenden Spielers
function determineStartingPlayer() {
    return getRandomNumber() < 0.5;
}

// Funktion zum Generieren einer Zufallszahl
function getRandomNumber() {
    let array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
}

// Funktion für das Spielende
function gameResult() {
    result = checkWinner();
    if (result === "") {
        gameRunning = false;
        return false;
    } else {
        gameRunning = true;
        return true;
    }
}

// Funktion zum Ändern der Farbe der Gewinnerzellen
function changeWinnerBlockColor(combination) {
    cellElements.forEach(cell => {
        if (cell.id === String(combination[0]) || cell.id === String(combination[1]) || cell.id === String(combination[2])) {
            cell.classList.add('winner')
        }
    })
}

// Funktion für einen zufälligen Zug
function getRandomMove() {
    let availableMoves = [];
    for (let i = 0; i < BOARD.length; i++) {
        if (BOARD[i] === "") {
            availableMoves.push(i);
        }
    }

    if (availableMoves.length > 0) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
        console.error("No available moves.");
        return -1;
    }
}

// Funktion für den besten Zug des Computers
function bestMove() {
    let bestScore = -Infinity;
    let move;

    let score;
    for (let i = 0; i < BOARD.length; i++) {
        if (BOARD[i] === "") {
            BOARD[i] = player[1];
            score = minimax(BOARD, false);
            BOARD[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    if (move !== undefined) {
        return move;
    } else {
        console.error("No best move found.");
        return -1;
    }
}

/* Funktion zum Aktualisieren der Spielerpunkte und Anzeigen in
 statusText und scoresText.*/
function updatePlayerScores(winner) {
    if (winner === "X" || winner === "O") {
        playerScores[winner]++;
        statusText.innerHTML = `${player1Name} vs ${player2Name}`;
        statusText.innerHTML = (winner === "X" || winner === "O") ? `${(winner === "X") ? player1Name : player2Name} ${winner} gewinnt!`: `Unentschieden!`;
        scoresText.innerHTML = `${player1Name}: ${playerScores.X} | ${player2Name}: ${playerScores.O} | Tie: ${playerScores.Tie}`;
    
        

    } else if (winner === "Tie") {
        playerScores.Tie++;
        statusText.innerHTML = `Unentschieden!`;
        scoresText.innerHTML = `${player1Name}: ${playerScores.X} | ${player2Name}: ${playerScores.O} | Tie: ${playerScores.Tie}`;

    } else {
        // statusText.innerHTML = `Spiel zu Ende!` muss noch in den Text eingefügt werden.
        scoresText.innerHTML = `${player1Name}: ${playerScores.X} | ${player2Name}: ${playerScores.O} | Tie: ${playerScores.Tie}`;
    }
}

// Minimax-Algorithmus für den Computerzug
function minimax(newBoard, isMaximizing) {
    let scoreValues = {
        X: -1,
        O: 1,
        Tie: 0,
    };
    let newResult = checkWinner();
    if (newResult !== "") {
        return scoreValues[newResult];
    }
    if (isMaximizing) {
        let bestScore = -Infinity;
        let score;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = player[1];
                score = minimax(newBoard, false);
                newBoard[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        let score;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === "") {
                newBoard[i] = player[0];
                score = minimax(newBoard, true);
                newBoard[i] = "";
                if (score < bestScore) {
                    bestScore = score;
                }
            }
        }
        return bestScore;
    }
}

// Funktion für den Zug des mittelschweren Bots
function mediumBotPlay() {
    if (Math.random() < 0.25) {
        return getRandomMove();
    } else {
        return bestMove();
    }
}

// Funktion für den menschlichen Zug
function humanPlay() {
    if (!gameRunning) {
        toggleCellClickListeners(true);
    }
}

// Funktion für den Spielablauf
function runGame() {
    if (gameResult()) {
        if (result === "Tie") {
            statusText.innerHTML = `${result}!`;
        } else {
            changeWinnerBlockColor(combinationArray);
            statusText.innerHTML = `${result} wins!`;
        }
        // Spielerpunkte aktualisieren und ausgeben
        if (result !== "") {
            updatePlayerScores(result);
        }
    } else {
        if (humanTurn) {
            statusText.innerHTML = `Spielzug von Spieler ${player1Name}`;
            currentPlayer = player[0];
            humanPlay();
        } else {
            statusText.innerHTML = `Spielzug von Spieler ${player2Name}`;
            currentPlayer = player[1];
            (clickedButtonContainer.whenPlayModeClicked === 'computer') ? botPlay() : humanPlay();
        }
    }
}

// Funktion für den Zug des Computers
function botPlay() {
    if (!gameRunning) {
        setTimeout(() => {
            let move;

            switch (clickedButtonContainer.whenDifficultyClicked) {
                case 'easy':
                    move = getRandomMove();
                    break;
                case 'medium':
                    move = mediumBotPlay();
                    break;
                case 'hard':
                    move = bestMove();
                    break;
                default:
                    move = getRandomMove();
            }

            cellElements[move].innerHTML = player[1];
            BOARD[move] = player[1];
            swapTurn();
            runGame();
        }, delays.botPlayDelay);
    }
}

// Funktion zum Wechseln des Zuges
function swapTurn() {
    humanTurn = !humanTurn;
    currentPlayer = (currentPlayer === "X") ? "O" : "X";
}

// Klick-Ereignis für Zellen
async function handleClick(e) {
    if (e.target.innerHTML === '' && !gameRunning) {
        toggleCellClickListeners(false);
        if (clickedButtonContainer.whenPlayModeClicked === 'computer') {
            e.target.innerHTML = player[0];
            let id = e.target.id;
            BOARD[id] = player[0];
        } else {
            e.target.innerHTML = currentPlayer;
            let id = e.target.id;
            BOARD[id] = currentPlayer;
        }
        swapTurn();
        runGame();
        await new Promise(resolve => setTimeout(resolve, delays.botPlayDelay));
        toggleCellClickListeners(true);
    }
}

// Funktion zum Zurückkehren zum Hauptmenü
function returnToMainMenu() {
    document.getElementById('player1').value = "";
    document.getElementById('player2').value = "";
    document.querySelector('.player-names-container').style.display = 'none';
        // Spieler-Namen-Variablen zurücksetzen

    toggleCellClickListeners(false);

    cellElements.forEach((cell) => {
        cell.innerHTML = '';
        cell.classList.remove('winner');
    });
    result = "";
    BOARD = ["", "", "", "", "", "", "", "", ""];
    gameRunning = false;
    gameContainer.classList.remove('active');
    modeContainer.classList.remove('active');
    difficultyContainer.classList.remove('active');
    resetButtons(playVersusButtons);
    resetButtons(difficultyButtons);
    resetButtons(symbolButtons);
    
    currentPlayer = null;
    toggleCellClickListeners(true);
    // Punkte zurücksetzen und ausblenden beim Zurück zum Hauptmenü
    resetScores();
    scoresText.style.display = 'none';
}


// Funktion zum Überprüfen des Gewinners
function checkWinner() {
    let winner = "";
    WINNING_COMBINATIONS.forEach((combination) => {
        if (
            BOARD[combination[0]] === "X" &&
            BOARD[combination[1]] === "X" &&
            BOARD[combination[2]] === "X"
        ) {
            combinationArray = combination;
            winner = "X";
        } else if (
            BOARD[combination[0]] === "O" &&
            BOARD[combination[1]] === "O" &&
            BOARD[combination[2]] === "O"
        ) {
            combinationArray = combination;
            winner = "O";
        }
    });
    if (winner === "") {
        let value = 0;
        BOARD.forEach((item) => {
            if (!(item === "")) {
                value += 1;
            }
        });
        if (value === 9) {
            winner = "Tie";
        } else {
            winner = "";
        }
    }
    return winner;
}

// Funktion zum Aktivieren/Deaktivieren der Klick-Ereignisse für Zellen
function toggleCellClickListeners(enable) {
    cellElements.forEach((cell) => {
        const clickEvent = "click";
        if (enable) {
            cell.addEventListener(clickEvent, handleClick, false);
        } else {
            cell.removeEventListener(clickEvent, handleClick, false);
        }
    });
}

// Klick-Ereignis für Rückkehr zum Hauptmenü
menuButton.addEventListener('click', returnToMainMenu);

// Funktion zum Hinzufügen von Klick-Ereignissen zu den Buttons
function attachClickEventListeners(buttons) {
    buttons.forEach(button => {
        button.addEventListener('click', () => handleButtonClick(buttons, button));
    });
}

// Funktion für das Behandeln von Button-Klicks
function handleButtonClick(buttons, button) {
    if (!gameRunning) {
        resetButtons(buttons);
        button.classList.add('active');
        handleGameMode(button);
    }
}

// Funktion für das Behandeln des Spielmodus
function handleGameMode(button) {
    let gameModeContainerDif = document.querySelector('.difficulty-container');
    if (gameModeContainerDif && button.id === 'computer') {
        gameModeContainerDif.classList.add('active');
    } else if (button.id === 'human' && gameModeContainerDif.classList.contains('active')) {
        gameModeContainerDif.classList.remove('active');
        resetButtons(difficultyButtons);
    }
}

// Funktion zum Zurücksetzen der Buttons
function resetButtons(buttons) {
    buttons.forEach(button => {
        button.classList.remove('active', 'err');
    });
}

// Klick-Ereignis für den "Play"-Button
function handlePlayButtonClick() {
    let activePlayVersusButton = [...playVersusButtons].find(findActiveButton);
    let activeSymbolButton = [...symbolButtons].find(findActiveButton);
    let activeDifficultyButton = [...difficultyButtons].find(findActiveButton);
    clickedButtonContainer = {
        whenPlayModeClicked: activePlayVersusButton ? activePlayVersusButton.id : null,
        whenDifficultyClicked: activeDifficultyButton ? activeDifficultyButton.id : activeDifficultyButton = null,
        whenSymbolClicked: activeSymbolButton ? activeSymbolButton.innerHTML : null
    };

    if (activePlayVersusButton && activeSymbolButton && activeDifficultyButton || activePlayVersusButton.id === 'human' && activeSymbolButton) {
        // Fehler-Text ausblenden, wenn alles in Ordnung ist
        errorText.style.display = 'none';
        initGameVariables();
        mainGame();
    } else {
        handleInvalidSelection(activePlayVersusButton, activeDifficultyButton, activeSymbolButton);
    }
}

// Funktion zum Finden des aktiven Buttons
function findActiveButton(button) {
    return button.classList.contains('active');
}

// Funktion zum Initialisieren der Spielvariablen
function initGameVariables() {
    gameContainer.classList.add('active');
    modeContainer.classList.add('active');
    difficultyContainer.classList.add('active');
    // Punkte anzeigen beim Spielstart
    scoresText.style.display = 'block';
}

// Funktion zum Hinzufügen eines Fehlers zu den Buttons
function addErrToButtons(buttons) {
    buttons.forEach(button => {
        button.classList.add('err');
    });
}

// Funktion für die Behandlung ungültiger Auswahl
function handleInvalidSelection(activePlayVersusButton, activeDifficultyButton, activeSymbolButton) {

    // Fehler-Text anzeigen, wenn nicht alle nötigen Buttons ausgewählt wurden
    errorText.innerHTML = 'Bitte alle nötigen Buttons auswählen und dann das Spiel starten.';
    errorText.style.display = 'block';

    // Fehler-Text nach ca. 4 Sekunden ausblenden
    setTimeout(() => {
        errorText.style.display = 'none';
    }, 3600);

    if (!activePlayVersusButton) {
        addErrToButtons(playVersusButtons);
        // Fehler-Text nach ca. 4 Sekunden ausblenden
        setTimeout(() => {
            errorText.style.display = 'none';
        }, 3600);
    }
    if (!activeSymbolButton) {
        addErrToButtons(symbolButtons);
    }
    if (!activeDifficultyButton) {
        addErrToButtons(difficultyButtons);
    }
}

// Funktion zum Einfärben der Symbole basierend auf den ausgewählten Optionen
function colorizeSymbols() {
    let selectedPlayer = clickedButtonContainer.whenSymbolClicked;

    // Stelle sicher, dass die Symbolelemente vorhanden sind
    let xColor = (selectedPlayer === 'X') ? 'red' : 'blue';
    let oColor = (selectedPlayer === 'X') ? 'blue' : 'red';

    // Weise den Symbolen im Spielfeld die entsprechenden Klassen zu
    let xSymbol = document.getElementById('symbols-x');
    let oSymbol = document.getElementById('symbols-o');

    //Füge die entsprechende Klasse für die Farbe hinzu
    xSymbol.classList.add(`symbols-${xColor}`);
    oSymbol.classList.add(`symbols-${oColor}`);
}

// Hauptspiellogik
function mainGame() {
    let selectedPlayer = clickedButtonContainer.whenSymbolClicked;
    player = [selectedPlayer, (selectedPlayer === 'X') ? 'O' : 'X'];
    startGame();
    // Weise den Symbolen im Spielfeld die entsprechenden Klassen zu
    colorizeSymbols();
    menuButton.addEventListener('click', returnToMainMenu);
}