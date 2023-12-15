import React, { useEffect } from "react";
import { Button } from "../Button";
import "./Game.css";
import { SoundWave } from "../SoundWave";

export const Game = ({ onSelectOption, onFinishRound, game }) => {
  const [timer, setTimer] = React.useState(15);
  const [selectedOption, setSelectedOption] = React.useState(null);

  useEffect(() => {
    if (timer === 0) {
      !setSelectedOption && setSelectedOption(selectedOption);
      onFinishRound();
      return;
    }

    setTimeout(() => setTimer(timer - 1), 1000);
  }, [timer]);

  return (
    <div className="game">
      <div className="game__top">
        <div>
          <h2 className="game__score"> Puntuación: {game.score}</h2>
        </div>
        <div>
          <h2 className="game__score">
            Ronda: {game.round}/{game.totalRounds}
          </h2>
        </div>
      </div>

      <audio id="audioPlayer" controls style={{ display: "none" }} autoPlay>
        <source src={game.songUrl} type="audio/mpeg" />
      </audio>

      <h1>{timer}</h1>

      <div className="game_countdown-bar">
        <div className="game_countdown-fill" />
      </div>

      <SoundWave />

      <div className="game_options">
        {game.options.map((option) => {
          return (
            <Button
              key={option.id}
              disabled={!!selectedOption}
              color={selectedOption === option.id && "#826c0a"}
              onClick={() => {
                setSelectedOption(option.id);
                onSelectOption(option.id);
              }}
            >
              {option.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
