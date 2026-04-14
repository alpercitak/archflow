import type { ImportResult } from './types';

export const importJson = (data: string): ImportResult => {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};
