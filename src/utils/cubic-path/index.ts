export const getCubicPath = (x1: number, y1: number, x2: number, y2: number): string => {
  const dx = Math.abs(x2 - x1) * 0.5;
  const dy = Math.abs(y2 - y1) * 0.12;
  const cx1 = x1 + dx;
  const cy1 = y1 + dy;
  const cx2 = x2 - dx;
  const cy2 = y2 - dy;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
};
