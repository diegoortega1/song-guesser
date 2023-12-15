import { useState } from "react";
import { Button } from "../Button";

export const Lobby = ({ onStartGame }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = () => {
    setIsLoading(true);
    onStartGame();
  };

  return (
    <>
      <div>
        <img
          src="https://m.media-amazon.com/images/I/61B9wpidCfL.png"
          className="logo"
          alt="Logo"
        />
      </div>
      {isLoading ? (
        <div style={{ color: "white" }}>Esperando jugadores ... </div>
      ) : (
        <div>
          <Button onClick={handleStartGame} color="#3cd47c">
            Comenzar partida
          </Button>
        </div>
      )}
    </>
  );
};
