import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function api(){
  return 'https://api.danielivanov.me'
  if (process.env.NODE_ENV === 'production') return 'https://api.danielivanov.me'
  else return 'http://localhost:8080'
}