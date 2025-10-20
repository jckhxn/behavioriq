// Appends UTM params to a URL if not present (MVP: just returns the URL for now)
export function withUTM(url: string): string {
  // In production, merge existing params and propagate UTM from location/search
  return url;
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
