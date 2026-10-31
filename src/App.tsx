import { Board } from "./components/Board";
import { pgn } from "./data/pgn";

export const App = () => {
  return (
    <div className="flex h-screen w-screen items-start justify-center bg-black pt-4 sm:items-center sm:pt-0">
      <Board pgn={pgn[0]} />
    </div>
  );
};
