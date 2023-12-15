import "./App.css";
import { useState, useEffect } from "react";
import { Lobby } from "./components/Lobby";
import { Game } from "./components/Game";
import { GameResult } from "./components/GameResult";

function App() {
  const [socket, setSocket] = useState(null);
  const [currentView, setCurrentView] = useState("lobby");
  const [count, setCount] = useState(3);
  const [game, setGame] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  function connectWebsocket() {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onopen = () => {
      setSocket(ws);
    };

    ws.onmessage = onServerMessage;
  }

  function onServerMessage(event) {
    const eventData = JSON.parse(event.data);

    switch (eventData.type) {
      case "initial":
        break;
      case "song":
        setGame(eventData.data);
        setCurrentView("startingGame");
        break;
      case "success":
      case "failure":
        setRoundResult(eventData.data);
        break;
      case "end":
        setCurrentView("gameEnded");
        setGameResult(eventData.data);
        break;
    }
  }

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  useEffect(() => {
    if (currentView === "startingGame") {
      if (count > 0) {
        setTimeout(() => setCount(count - 1), 1000);
      } else {
        setCurrentView("inGame");
      }
    } else {
      setCount(3);
    }
  }, [count, currentView]);

  if (currentView === "startingGame") {
    return (
      <div className="mainContainer">
        <div id="contador" className="countDown">
          {count}
        </div>
      </div>
    );
  }

  if (currentView === "gameEnded") {
    return (
      <div className="mainContainer">
        <h1>Fin de la partida</h1>
        <h2>¡Gracias por jugar!</h2>

        <h3>Puntuación final: {gameResult.score}</h3>
        {gameResult.gameResult === "Draw" && <h3>¡Empate!</h3>}
        {gameResult.gameResult === "Win" && <h3>¡Victoria!</h3>}
        {gameResult.gameResult === "Lose" && <h3>¡Derrota!</h3>}
      </div>
    );
  }

  if (currentView === "inGame") {
    return (
      <Game
        onSelectOption={handleSelectOption}
        game={game}
        onFinishRound={handleFinishRound}
      />
    );
  }

  if (currentView === "gameResult") {
    return <GameResult gameResult={roundResult} />;
  }

  return <Lobby onStartGame={handleStartGame} />;

  function handleSelectOption(optionId) {
    socket.send(JSON.stringify({ type: "answer", optionId }));
  }

  function handleStartGame() {
    connectWebsocket();
  }

  function handleFinishRound() {
    setCurrentView("gameResult");
    socket.send(JSON.stringify({ type: "nextRound" }));
  }
}

export default App;
