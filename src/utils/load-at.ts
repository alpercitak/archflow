import type { LoadProfile } from '@/types';

/** Client request rate at time t (seconds) for a load profile; without a profile the base load applies. */
export const loadAt = (base: number, profile: LoadProfile | undefined, t: number): number => {
  if (!profile || t < profile.startS) {
    return base;
  }
  const elapsed = t - profile.startS;
  switch (profile.kind) {
    case 'ramp':
      if (profile.durationS === 0 || elapsed >= profile.durationS) {
        return profile.peak;
      }
      return base + (profile.peak - base) * (elapsed / profile.durationS);
    case 'spike':
      return elapsed < profile.durationS ? profile.peak : base;
    case 'wave':
      if (profile.durationS === 0) {
        return base;
      }
      return base + ((profile.peak - base) * (1 - Math.cos((2 * Math.PI * elapsed) / profile.durationS))) / 2;
  }
};
