import { load } from 'js-yaml';
import type { ImportResult } from './types';

export const importYaml = (data: string): ImportResult => {
  try {
    return load(data) as ImportResult;
  } catch {
    return null;
  }
};
