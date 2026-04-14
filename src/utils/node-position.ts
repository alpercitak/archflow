const BASE = 200 as const;
const VARIANCE = 50 as const;

export const getRandomNodePosition = () => BASE + Math.random() * VARIANCE;
