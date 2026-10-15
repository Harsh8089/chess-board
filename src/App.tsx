import { Board } from "./components/Board";

export const App = () => {
  return (
    <div className="flex h-screen w-screen items-start justify-center bg-black pt-4 sm:items-center sm:pt-0">
      <Board
        fen={
          "2r1k2r/1pqbbppp/4p3/3pP3/1P1N1PP1/p1P1Q3/Pn3BBP/2R2RK1 b k - 4 20"
        }
      />
    </div>
  );
};
