// --- Variables del Juego ---
let playerHP = 100;
let inventory = [];
let currentScene = "intro";

// Referencias a los elementos HTML
const gameTextElement = document.getElementById("game-text");
const optionsContainer = document.getElementById("options-container");

// --- Lógica del Juego (Objetos para las escenas) ---
const gameScenes = {
    intro: {
        text: "¡Bienvenido a la Aventura de la Mazmorra! Tu misión es sobrevivir y encontrar la salida.",
        options: [
            { text: "Comenzar la aventura", nextScene: "entrada_mazmorra" }
        ]
    },
    entrada_mazmorra: {
        text: "Estás en la entrada de la 'Mazmorra del Lamento'. El aire es frío y el camino se divide en dos.",
        options: [
            { text: "Tomar el camino de la derecha (combate)", nextScene: "combate_goblin" },
            { text: "Tomar el camino de la izquierda", nextScene: "pasillo_oscuro" }
        ]
    },
    combate_goblin: {
        text: "Un goblin te ha emboscado. Tienes que luchar!",
        onEnter: function() {
            // Lógica de combate simple
            const goblinHP = 40;
            const goblinDamage = 15;
            playerHP -= goblinDamage;
            let message = `Luchas contra el goblin y te hiere, pierdes ${goblinDamage} de vida.`;
            if (playerHP <= 0) {
                message += "\nHas sido derrotado en combate.";
                displayScene("game_over", message);
            } else {
                message += ` Te quedan ${playerHP} de vida. Avanzas.`;
                displayScene("pasillo_oscuro", message);
            }
        },
        options: []
    },
    pasillo_oscuro: {
        text: "El pasillo es tan oscuro que apenas ves. Oyes ruidos al final. ¿Qué haces?",
        options: [
            { text: "Continuar a ciegas", nextScene: "trampa_murcielago" },
            { text: "Buscar una antorcha (si la tienes)", nextScene: "sala_tesoros" }
        ]
    },
    trampa_murcielago: {
        onEnter: function() {
            playerHP -= 10;
            let message = "Avanzas en la oscuridad y un murciélago te muerde. Pierdes 10 de vida.";
            if (playerHP <= 0) {
                message += "\nHas sido derrotado.";
                displayScene("game_over", message);
            } else {
                message += ` Te quedan ${playerHP} de vida. Avanzas a la sala del tesoro.`;
                displayScene("sala_tesoros", message);
            }
        },
        options: []
    },
    sala_tesoros: {
        text: "Llegas a una gran sala. Un cofre brillante está en el centro.",
        options: [
            { text: "Abrir el cofre", nextScene: "obtener_pocion" },
            { text: "Pasar de largo", nextScene: "camara_final" }
        ]
    },
    obtener_pocion: {
        onEnter: function() {
            inventory.push("Poción de Vida");
            let message = "Abres el cofre y encuentras una 'Poción de Vida'!";
            displayScene("camara_final", message);
        },
        options: []
    },
    camara_final: {
        text: "Entras en la cámara final. Un gran troll bloquea el paso. No hay otra opción que luchar.",
        onEnter: function() {
            if (playerHP < 30 && inventory.includes("Poción de Vida")) {
                let message = "Usas tu poción de vida para curarte antes de luchar. Ganas 30 de vida.";
                playerHP += 30;
                inventory.splice(inventory.indexOf("Poción de Vida"), 1);
                alert(message);
            }
            // Simulación de combate final
            const trollHP = 80;
            const trollDamage = 25;
            playerHP -= trollDamage;
            let message = `Luchas contra el troll y te hiere, pierdes ${trollDamage} de vida.`;
            if (playerHP <= 0) {
                message += "\nHas sido derrotado. ¡GAME OVER!";
                displayScene("game_over", message);
            } else {
                message += "\n¡Has derrotado al troll! La salida está libre. ¡Felicidades!";
                displayScene("juego_terminado", message);
            }
        },
        options: []
    },
    game_over: {
        text: "--- ¡GAME OVER! Tu aventura ha terminado. ---",
        options: [
            { text: "Reiniciar", nextScene: "reset" }
        ]
    },
    juego_terminado: {
        text: "--- ¡HAS GANADO! Has completado tu aventura. ---",
        options: [
            { text: "Jugar de nuevo", nextScene: "reset" }
        ]
    },
    reset: {
        onEnter: function() {
            playerHP = 100;
            inventory = [];
            currentScene = "intro";
            displayScene(currentScene);
        },
        options: []
    }
};

// --- Funciones del DOM y Flujo del Juego ---

function displayScene(sceneName, customText = null) {
    const scene = gameScenes[sceneName];
    gameTextElement.innerText = customText || scene.text;
    optionsContainer.innerHTML = '';
    
    if (scene.onEnter) {
        scene.onEnter();
        return;
    }
    
    scene.options.forEach(option => {
        const button = document.createElement("button");
        button.innerText = option.text;
        button.addEventListener("click", () => {
            currentScene = option.nextScene;
            displayScene(currentScene);
        });
        optionsContainer.appendChild(button);
    });
    
    // Mostrar estado del jugador
    const playerStatus = document.createElement("p");
    playerStatus.innerText = `\nVida: ${playerHP} | Inventario: ${inventory.join(', ') || 'Vacío'}`;
    gameTextElement.appendChild(playerStatus);
}

// Inicia el juego
document.addEventListener("DOMContentLoaded", () => {
    displayScene(currentScene);
});
