import { pieces } from "./fresca";

type PieceColor = "w" | "b";
type PieceType = "k" | "q" | "r" | "b" | "n" | "p";

export const getPieceImage = (
  color: PieceColor,
  type: PieceType,
) => {
  const key = `${color}${type.toUpperCase()}` as keyof typeof pieces;

  return pieces[key];
};