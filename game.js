// --- Variables del Juego ---
let playerName = "Aventurero";
let playerHP = 100;
let inventory = []; // Solo almacenará los NOMBRES de los ítems
let gameState = "start";
let currentScene = "entrada_mazmorra";

// Mapeo de nombres de ítems a rutas de imagen
const itemIcons = {
    "Antorcha": "assets/antorcha_icon.png",
    "Poción de Vida": "assets/pocion_icon.png"
};

// Referencias a los elementos HTML
const screens = {
    start: document.getElementById("start-screen"),
    game: document.getElementById("game-screen"),
    end: document.getElementById("end-screen")
};
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

const playerNameInput = document.getElementById("player-name-input");
const playerNameEl = document.getElementById("player-name");
const playerHPEl = document.getElementById("player-hp");

const inventoryIconsContainer = document.getElementById("inventory-icons");

const gameTitleEl = document.getElementById("game-title");
const gameTextEl = document.getElementById("game-text");
const optionsContainerEl = document.getElementById("options-container");
const endMessageEl = document.getElementById("end-message");
const endStatusEl = document.getElementById("end-status");
const endImageEl = document.getElementById("end-image");

const backgroundImageContainer = document.getElementById("background-image-container");
const combatDisplayEl = document.getElementById("combat-display");
const playerSpriteEl = document.getElementById("player-sprite");
const enemySpriteEl = document.getElementById("enemy-sprite");


// --- Datos del Juego ---
const gameData = {
    escenas: {
        entrada_mazmorra: {
            title: "La Puerta de la Mazmorra",
            text: `Te encuentras frente a la imponente entrada de la 'Mazmorra del Lamento', ${playerName}. El aire es frío y el camino se divide en dos.`,
            background: "assets/bg_entrada.png",
            options: [
                { text: "Tomar el camino de la derecha", action: "ir", target: "camino_derecha" },
                { text: "Tomar el camino de la izquierda", action: "ir", target: "pasillo_oscuro" }
            ]
        },
        camino_derecha: {
            title: "El Nido del Goblin",
            text: "Un pequeño goblin salta de un arbusto y te ataca.",
            background: "assets/bg_combate_goblin.png",
            enemySprite: "assets/goblin_sprite.png",
            options: [
                { text: "Luchar contra el goblin", action: "luchar", target: { name: "Goblin", hp: 40, dmg: [5, 15], reward: ["Antorcha"] } }
            ]
        },
        pasillo_oscuro: {
            title: "El Pasillo Silencioso",
            text: "El pasillo es tan oscuro que apenas ves. Oyes ruidos de aleteo al final.",
            background: "assets/bg_pasillo.png",
            options: [
                { text: "Avanzar con cuidado", action: "ir", target: "sala_murcielagos" }
            ]
        },
        sala_murcielagos: {
            title: "La Sala de los Murciélagos",
            text: "Una bandada de murciélagos te ataca.",
            background: "assets/bg_combate_murcielagos.png",
            enemySprite: "assets/bat_sprite.png",
            options: [
                { text: "Luchar contra la bandada", action: "luchar", target: { name: "Bandada de Murciélagos", hp: 50, dmg: [8, 12], reward: [] } },
                { text: "Huir a toda prisa", action: "ir", target: "trampa_falsa", condition: () => true }
            ]
        },
        trampa_falsa: {
            title: "El Engaño de la Trampa",
            text: "Corres sin mirar y caes en una fosa. Pierdes 10 de vida.",
            background: "assets/bg_trampa.png",
            options: [
                { text: "Buscar una salida", action: "ir", target: "sala_tesoros" }
            ],
            onEnter: () => {
                playerHP -= 10;
                updateStatus();
            }
        },
        sala_tesoros: {
            title: "La Cámara del Botín",
            text: "Una gran sala con un cofre brillante en el centro.",
            background: "assets/bg_tesoro.png",
            options: [
                { text: "Abrir el cofre", action: "ir", target: "cofre_abierto" },
                { text: "Ignorar el cofre y seguir", action: "ir", target: "camara_final" }
            ]
        },
        cofre_abierto: {
            title: "Poción de Vida",
            text: "Encuentras una 'Poción de Vida' que restaura 30 de vida.",
            background: "assets/bg_tesoro.png",
            options: [
                { text: "Continuar a la siguiente cámara", action: "ir", target: "camara_final" }
            ],
            onEnter: () => {
                playerHP = Math.min(100, playerHP + 30);
                inventory.push("Poción de Vida");
                updateStatus();
            }
        },
        camara_final: {
            title: "El Guardián del Tesoro",
            text: "Un enorme troll te bloquea el camino hacia la salida.",
            background: "assets/bg_combate_troll.png",
            enemySprite: "assets/troll_sprite.png",
            options: [
                { text: "Enfrentar al troll", action: "luchar", target: { name: "Troll", hp: 120, dmg: [20, 30], reward: [] } }
            ]
        },
        juego_terminado: {
            title: "Victoria",
            text: `¡Felicidades, ${playerName}! Has logrado escapar de la mazmorra con vida.`,
            background: "assets/bg_victoria.png",
            endImage: "assets/end_win.png",
            options: []
        },
        game_over: {
            title: "Derrota",
            text: `Tu aventura ha llegado a su fin, ${playerName}.`,
            background: "assets/bg_game_over.png",
            endImage: "assets/end_lose.png",
            options: []
        }
    }
};

// --- Lógica del Juego ---

function updateStatus() {
    playerNameEl.innerText = playerName;
    playerHPEl.innerText = `Vida: ${playerHP}`;
    
    // Actualizar el inventario visual
    inventoryIconsContainer.innerHTML = '';
    if (inventory.length === 0) {
        inventoryIconsContainer.innerHTML = '<span class="inventory-empty-text">Vacío</span>';
    } else {
        inventory.forEach(item => {
            if (itemIcons[item]) {
                const img = document.createElement("img");
                img.src = itemIcons[item];
                img.alt = item;
                img.title = item;
                img.classList.add("inventory-icon");
                inventoryIconsContainer.appendChild(img);
            }
        });
    }
}

function showScreen(screen) {
    for (let key in screens) {
        screens[key].classList.add("hidden");
        screens[key].classList.remove("active");
    }
    screens[screen].classList.add("active");
    screens[screen].classList.remove("hidden");
    gameState = screen;
}

function displayScene(sceneName) {
    if (gameState !== "playing") return;

    const scene = gameData.escenas[sceneName];
    currentScene = sceneName;

    gameTitleEl.innerText = scene.title;
    gameTextEl.innerText = scene.text.replace("${playerName}", playerName);
    optionsContainerEl.innerHTML = '';
    
    backgroundImageContainer.style.backgroundImage = `url('${scene.background}')`;
    
    combatDisplayEl.classList.add("hidden");
    playerSpriteEl.classList.add("hidden");
    enemySpriteEl.classList.add("hidden");

    if (scene.onEnter) {
        scene.onEnter();
    }

    scene.options.forEach(option => {
        const button = document.createElement("button");
        button.classList.add("pixel-button");
        button.innerText = option.text;
        button.addEventListener("click", () => handleAction(option));
        optionsContainerEl.appendChild(button);
    });

    updateStatus();
}

function handleAction(option) {
    switch (option.action) {
        case "ir":
            if (option.target) {
                displayScene(option.target);
            }
            break;
        case "luchar":
            combatDisplayEl.classList.remove("hidden");
            playerSpriteEl.classList.remove("hidden");
            enemySpriteEl.classList.remove("hidden");
            enemySpriteEl.src = gameData.escenas[currentScene].enemySprite;

            handleCombat(option.target);
            break;
    }
}

let combatInterval;

function handleCombat(enemy) {
    let enemyHP = enemy.hp;
    const combatLog = [`¡Un ${enemy.name} te ataca!`];
    gameTextEl.innerText = combatLog.join("\n");

    combatInterval = setInterval(() => {
        if (playerHP <= 0 || enemyHP <= 0) {
            clearInterval(combatInterval);
            if (playerHP > 0) {
                endCombat(true, enemy);
            } else {
                endCombat(false, enemy);
            }
            return;
        }

        const playerDamage = Math.floor(Math.random() * (20 - 10 + 1) + 10);
        enemyHP -= playerDamage;
        combatLog.push(`${playerName} ataca y le hace ${playerDamage} de daño a ${enemy.name}.`);

        if (enemyHP <= 0) { return; }

        const enemyDamage = Math.floor(Math.random() * (enemy.dmg[1] - enemy.dmg[0] + 1) + enemy.dmg[0]);
        playerHP -= enemyDamage;
        combatLog.push(`El ${enemy.name} te ataca y te hace ${enemyDamage} de daño.`);
        combatLog.push(`Tu vida: ${playerHP} | Vida del ${enemy.name}: ${enemyHP}`);

        gameTextEl.innerText = combatLog.join("\n");
        gameTextEl.scrollTop = gameTextEl.scrollHeight;
        updateStatus();
    }, 1500);
}

function endCombat(win, enemy) {
    combatDisplayEl.classList.add("hidden");
    if (win) {
        gameTextEl.innerText += `\n¡Has derrotado al ${enemy.name}!`;
        if (enemy.reward.length > 0) {
            enemy.reward.forEach(item => {
                inventory.push(item);
            });
            gameTextEl.innerText += `\nEncuentras: ${enemy.reward.join(", ")}.`;
        }
        optionsContainerEl.innerHTML = `<button class="pixel-button" onclick="displayScene('sala_tesoros')">Continuar</button>`;
    } else {
        endGame(`Has sido derrotado en combate por el ${enemy.name}.`);
    }
}

function endGame(message, status = "perdiste") {
    endMessageEl.innerText = status === "ganaste" ? "¡Victoria!" : "¡Derrota!";
    endStatusEl.innerText = message;
    endImageEl.src = gameData.escenas[currentScene].endImage;
    showScreen("end");
}

function resetGame() {
    playerName = "Aventurero";
    playerHP = 100;
    inventory = [];
    currentScene = "entrada_mazmorra";
    playerNameInput.value = "";
    showScreen("start");
}

// --- Event Listeners ---
startButton.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (name) {
        playerName = name;
    } else {
        playerName = "Aventurero";
    }
    showScreen("game");
    displayScene("entrada_mazmorra");
});

restartButton.addEventListener("click", resetGame);

// Iniciar el juego en la pantalla de inicio
showScreen("start");
