import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function merge_class_names(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
