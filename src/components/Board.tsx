import { useState } from "react";
import { Chess } from "chess.js";
import { getPieceImage } from "../pieces/getPieces";

type Props = {
  fen: string;
  showPieces?: boolean;
  showNotation?: boolean;
};
export const Board = ({
  fen,
  showPieces = true,
  showNotation = true,
}: Props) => {
  const [position, setPosition] = useState(fen);
  const [draggedPiece, setDraggedPiece] = useState<string>("");

  const chess = new Chess(position);
  const board = chess.board();

  const handleDragStart = (
    e: React.DragEvent<HTMLImageElement>,
    from: string,
  ) => {
    // e.dataTransfer.setData("text/plain", JSON.stringify({ from }));
    e.dataTransfer.effectAllowed = "move";
    setDraggedPiece(from);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, to: string) => {
    e.preventDefault();

    // const { from } = JSON.parse(e.dataTransfer.getData("text/plain"));
    const from = draggedPiece;

    try {
      chess.move({ from, to });
      setPosition(chess.fen());
    } catch {
      // Invalid moves are ignored for now.
      console.error("err");
    } finally {
      setDraggedPiece("");
    }
  };

  return (
    <div className="mx-2 grid aspect-square w-full max-w-[850px] grid-cols-8">
      {board.map((rank, rowIndex) =>
        rank.map((piece, colIndex) => {
          const file = FILE[colIndex];
          const rankNumber = 8 - rowIndex;
          const square = `${file}${rankNumber}`;
          const isLight = (rowIndex + colIndex) % 2 === 0;

          return (
            <div
              key={square}
              className={`relative flex items-center justify-center ${
                isLight ? "bg-[#F0D9B5]" : "bg-[#B58863]"
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, square)}
            >
              {showPieces && piece && (
                <img
                  src={getPieceImage(piece.color, piece.type)}
                  alt={`${piece.color === "w" ? "White" : "Black"} ${piece.type}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, square)}
                  className={`h-[95%] w-[95%] select-none object-contain ${
                    draggedPiece === square ? "opacity-30" : "opacity-100"
                  }`}
                />
              )}
              {showNotation && colIndex === 0 && (
                <span className="absolute left-1 top-1 text-xs font-semibold">
                  {rankNumber}
                </span>
              )}
              {showNotation && rowIndex === 7 && (
                <span className="absolute bottom-1 right-1 text-xs font-semibold">
                  {file}
                </span>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
};

const FILE = ["a", "b", "c", "d", "e", "f", "g", "h"];
