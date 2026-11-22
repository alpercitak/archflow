import { load } from 'js-yaml';

export const importYaml = (data: string): unknown => load(data);
