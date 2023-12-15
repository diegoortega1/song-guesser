import { Button } from "../Button";
import "../../App.css";
import "./GameResult.css";

export const GameResult = ({ gameResult }) => {
  return (
    <div className="game-result">
      <div className="game-result__top">
        <div>
          <h2 className="game-result__score">Puntuación: {gameResult.score}</h2>
        </div>
        <div>
          <h2 className="game-result__score">
            Ronda: {gameResult.round}/{gameResult.totalRounds}
          </h2>
        </div>
      </div>
      <div>
        <img src={gameResult.songCoverImage} alt="Song cover" height="100%" />
      </div>

      <div className="game-result_options">
        {gameResult.options.map((option) => {
          return (
            <Button key={option.id} disabled color={getButtonColor(option.id)}>
              {option.name}
            </Button>
          );
        })}
      </div>
    </div>
  );

  function getButtonColor(optionId) {
    const { selectedOption, correctOption } = gameResult;

    if (optionId === correctOption) {
      return "#3cd47c";
    }

    if (optionId === selectedOption) {
      return selectedOption === correctOption ? "#3cd47c" : "#f44336";
    }

    return "#FFFF";
  }
};
