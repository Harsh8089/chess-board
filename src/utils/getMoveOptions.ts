import type { Chess, Square } from "chess.js";

// chess.js only returns moves for the side to move, so an empty square
// or an opponent's piece naturally yields [].
export const getMoveOptions = (chess: Chess, square: Square): Square[] =>
  chess.moves({ square, verbose: true }).map((move) => move.to);