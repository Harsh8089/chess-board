import { useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { getPieceImage } from "../pieces/getPieces";
import { getMoveOptions } from "../utils/getMoveOptions";

export type NotationMode = "inside" | "outside" | "none";

type Props = {
  pgn: string;
  showPieces?: boolean;
  showMoveOptions?: boolean;
  notation?: NotationMode;
};

type Drag = { from: Square; x: number; y: number };
type LastMove = { from: Square; to: Square };

const FILES = "abcdefgh".split("");
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];
const NOTATION_TEXT = "text-sm sm:text-base";

const getFen = (pgn: string, plies: number): string => {
  const chess = new Chess();
  chess.loadPgn(pgn);

  const moves = chess.history({ verbose: true });
  if (moves.length === 0) return chess.fen();

  // Clamp in case the game is shorter than requested.
  return moves[Math.min(plies, moves.length) - 1]?.after ?? moves[0].before;
};

export const Board = ({
  pgn,
  showPieces = true,
  showMoveOptions = true,
  notation = "inside",
}: Props) => {
  const [position, setPosition] = useState(getFen(pgn, 8));
  const [selected, setSelected] = useState<Square | null>(null);
  const [moveOptions, setMoveOptions] = useState<Square[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);

  // Last move (from/to squares), kept in a ref; it is always updated together with `position`.
  const lastMove = useRef<LastMove | null>(null);
  // True when a press started on a piece that was already selected (i.e. a second click).
  const wasSelected = useRef(false);

  const chess = new Chess(position);
  const turn = chess.turn();

  const select = (square: Square | null) => {
    setSelected(square);
    setMoveOptions(
      square && showMoveOptions ? getMoveOptions(chess, square) : [],
    );
  };

  const movePiece = (from: Square, to: Square) => {
    try {
      chess.move({ from, to, promotion: "q" });
      lastMove.current = { from, to };
      setPosition(chess.fen());
      select(null);
    } catch {
      // Illegal move.
    }
  };

  const handlePointerDown = (e: React.PointerEvent, square: Square) => {
    wasSelected.current = false;

    const piece = chess.get(square);
    if (!piece || piece.color !== turn) return;

    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ from: square, x: e.clientX, y: e.clientY });

    if (selected === square) wasSelected.current = true;
    else select(square);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (drag) setDrag({ ...drag, x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag) return;

    const target = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-square]")?.dataset.square as
      | Square
      | undefined;

    if (target && target !== drag.from) {
      wasSelected.current = false; // A drag is not a "second click".
      movePiece(drag.from, target);
    }
    setDrag(null);
  };

  const handleSquareClick = (square: Square) => {
    if (!showMoveOptions) return;

    // Clicking a legal destination moves the selected piece.
    if (selected && moveOptions.includes(square)) {
      movePiece(selected, square);
      return;
    }

    if (!chess.get(square)) {
      select(null);
      return;
    }

    // Clicking the selected piece again toggles its move options.
    if (selected === square && wasSelected.current) {
      wasSelected.current = false;
      setMoveOptions(moveOptions.length ? [] : getMoveOptions(chess, square));
      return;
    }

    // Any piece gets highlighted; only the current player's pieces have move options.
    select(square);
  };

  const draggedPiece = drag && chess.get(drag.from);
  const last = lastMove.current;

  return (
    <>
      <div className="mx-2 w-full max-w-[850px]">
        <div className="flex">
          {notation === "outside" && (
            <div className={`flex w-6 flex-col ${NOTATION_TEXT}`}>
              {RANKS.map((rank) => (
                <span
                  key={rank}
                  className="flex flex-1 items-center justify-center"
                >
                  {rank}
                </span>
              ))}
            </div>
          )}
          <div
            className="grid aspect-square min-w-0 flex-1 touch-none select-none
              grid-cols-[repeat(8,minmax(0,1fr))] grid-rows-[repeat(8,minmax(0,1fr))]"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {chess.board().map((rank, row) =>
              rank.map((piece, col) => {
                const file = FILES[col];
                const rankNumber = RANKS[row];
                const square = `${file}${rankNumber}` as Square;

                const isLegalMove =
                  showMoveOptions && moveOptions.includes(square);
                const isCapture = isLegalMove && !!piece;
                const ring =
                  selected === square
                    ? "ring-4 ring-inset ring-sky-500/70"
                    : isCapture
                      ? "ring-4 ring-inset ring-red-500/80"
                      : "";

                return (
                  <div
                    key={square}
                    data-square={square}
                    className={`relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden ${ring}
                      ${(row + col) % 2 === 0 ? "bg-[#F0D9B5]" : "bg-[#B58863]"}`}
                    onPointerDown={(e) => handlePointerDown(e, square)}
                    onClick={() => handleSquareClick(square)}
                  >
                    {last?.from === square && (
                      <span className="pointer-events-none absolute inset-0 bg-yellow-300/30" />
                    )}
                    {last?.to === square && (
                      <span className="pointer-events-none absolute inset-0 bg-yellow-300/60" />
                    )}
                    {showPieces && piece && (
                      <img
                        src={getPieceImage(piece.color, piece.type)}
                        alt={`${piece.color === "w" ? "White" : "Black"} ${piece.type}`}
                        draggable={false}
                        className={`relative h-[95%] w-[95%] select-none object-contain
                          ${drag?.from === square ? "opacity-30" : ""}`}
                      />
                    )}
                    {isLegalMove && !piece && (
                      <span className="pointer-events-none absolute h-8 w-8 rounded-full bg-black/40 sm:h-5 sm:w-5" />
                    )}
                    {isCapture && (
                      <span className="pointer-events-none absolute inset-0 rounded-full border-4 border-black/30" />
                    )}
                    {notation === "inside" && col === 0 && (
                      <span
                        className={`pointer-events-none absolute left-1 top-1 ${NOTATION_TEXT}`}
                      >
                        {rankNumber}
                      </span>
                    )}
                    {notation === "inside" && row === 7 && (
                      <span
                        className={`pointer-events-none absolute bottom-1 right-1 ${NOTATION_TEXT}`}
                      >
                        {file}
                      </span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
        {notation === "outside" && (
          <div className={`flex pl-6 ${NOTATION_TEXT}`}>
            {FILES.map((file) => (
              <span key={file} className="flex-1 text-center">
                {file}
              </span>
            ))}
          </div>
        )}
      </div>
      {drag && draggedPiece && (
        <img
          src={getPieceImage(draggedPiece.color, draggedPiece.type)}
          alt={drag.from}
          draggable={false}
          className="pointer-events-none fixed z-50 h-30 w-30 select-none object-contain"
          style={{
            left: drag.x,
            top: drag.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </>
  );
};
