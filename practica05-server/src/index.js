const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const songs = require("./songs.json");
const games = songs.songs;

const clients = new Map();
let currentGame;
let currentRound = 0;
let clientsRespondedCount = 0;
let totalRounds = 5;
let scores = {};
let isFirstPlayerAnswer = true;

// Número mínimo de jugadores requeridos para comenzar el juego
const minPlayersToStart = 2;
let playersReady = 0;

function updateSong() {
    currentRound++;
    clientsRespondedCount = 0;
    isFirstPlayerAnswer = true;

    // Obtén la lista de canciones que no se han reproducido en esta ronda
    const availableSongs = games.filter((song) => !song.played);

    if (availableSongs.length === 0) {
        // Si todas las canciones se han reproducido, reinicia el estado "played" de todas las canciones
        games.forEach((song) => (song.played = false));
    }

    // Selecciona una canción aleatoria de las disponibles
    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    currentGame = availableSongs[randomIndex];
    currentGame.played = true; // Marca la canción como reproducida

    const songUrl = currentGame.songUrl;
    const options = currentGame.options;

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: "song",
                    data: {
                        songUrl,
                        round: currentRound,
                        totalRounds,
                        score: scores[clients.get(client).playerId] || 0,
                        options,
                    },
                })
            );
        }
    });
}

function startGame() {
    currentRound = 0;
    scores = {};
    games.forEach((song) => (song.played = false));
    updateSong();
}

function getWinner() {
    let maxScore = 0;
    let winner = "";

    for (const playerId in scores) {
        if (scores.hasOwnProperty(playerId) && scores[playerId] > maxScore) {
            maxScore = scores[playerId];
            winner = playerId;
        } else if (
            scores.hasOwnProperty(playerId) &&
            scores[playerId] === maxScore
        ) {
            winner = "";
        }
    }

    return winner;
}

wss.on("connection", (ws) => {
    const playerId = uuidv4();
    clients.set(ws, { playerId });
    console.log(`Cliente conectado. ID: ${playerId}`);

    ws.send(
        JSON.stringify({
            type: "initial",
            data: { round: currentRound, totalRounds },
        })
    );

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.type === "answer") {
            const clientInfo = clients.get(ws);
            const playerAnswer = data.optionId;

            // Verificar si la respuesta es correcta
            const isCorrectAnswer = playerAnswer === currentGame.correctAnswer;

            if (isCorrectAnswer) {
                const variableScore = isFirstPlayerAnswer ? 2 : 1;
                scores[clientInfo.playerId] =
                    (scores[clientInfo.playerId] || 0) + variableScore;
                isFirstPlayerAnswer = false;
                ws.send(
                    JSON.stringify({
                        type: "success",
                        data: {
                            score: scores[clientInfo.playerId] ?? 0,
                            selectedOption: playerAnswer,
                            correctOption: currentGame.correctAnswer,
                            songCoverImage: currentGame.songCoverImage,
                            options: currentGame.options,
                            round: currentRound,
                            totalRounds,
                        },
                    })
                );
            } else {
                ws.send(
                    JSON.stringify({
                        type: "failure",
                        data: {
                            score: scores[clientInfo.playerId] ?? 0,
                            selectedOption: playerAnswer,
                            correctOption: currentGame.correctAnswer,
                            songCoverImage: currentGame.songCoverImage,
                            options: currentGame.options,
                            round: currentRound,
                            totalRounds,
                        },
                    })
                );
            }
        }

        if (data.type === "nextRound") {
            clientsRespondedCount++;
            console.log(currentRound)
            if (
                currentRound < totalRounds &&
                clientsRespondedCount === clients.size
            ) {
                setTimeout(() => {
                    updateSong();
                }, 5000); // 5 segundos de espera entre canciones;
            } else if (
                currentRound === totalRounds &&
                clientsRespondedCount === clients.size
            ) {
                const winner = getWinner();
                setTimeout(() => {
                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(
                                JSON.stringify({
                                    type: "end",
                                    data: {
                                        gameResult: !winner ?
                                            "Draw" : clients.get(client).playerId === winner ?
                                            "Win" : "Lose",
                                        score: scores[clients.get(client).playerId] || 0,
                                    },
                                })
                            );
                        }
                    });
                }, 5000);
                //resetGame();
            }
        }
    });

    ws.on("close", () => {
        clients.delete(ws);
        playersReady--;
    });

    // Incrementar el número de jugadores listos
    playersReady++;

    // Comenzar el juego cuando se alcance el número mínimo de jugadores
    if (playersReady >= minPlayersToStart) {
        startGame();
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor WebSocket escuchando en el puerto ${PORT}`);
});