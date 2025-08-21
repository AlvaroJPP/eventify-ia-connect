// Importa a função clsx para combinar classes condicionalmente.
import { clsx, type ClassValue } from "clsx"
// Importa a função twMerge para mesclar classes do Tailwind CSS.
import { twMerge } from "tailwind-merge"

/**
 * Combina e mescla classes do Tailwind CSS.
 * @param inputs - As classes a serem combinadas.
 * @returns As classes combinadas e mescladas.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}