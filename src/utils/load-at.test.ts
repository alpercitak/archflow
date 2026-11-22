import { loadAt } from '@/utils/load-at';
import { describe, expect, test } from 'bun:test';

describe('loadAt', () => {
  test('without a profile returns the base load', () => {
    expect(loadAt(100, undefined, 50)).toBe(100);
  });

  test('before the start time returns the base load for every kind', () => {
    for (const kind of ['ramp', 'spike', 'wave'] as const) {
      expect(loadAt(100, { kind, peak: 500, startS: 10, durationS: 20 }, 5)).toBe(100);
    }
  });

  test('ramp rises linearly and holds the peak after the ramp', () => {
    const profile = { kind: 'ramp' as const, peak: 300, startS: 10, durationS: 20 };
    expect(loadAt(100, profile, 10)).toBe(100);
    expect(loadAt(100, profile, 20)).toBe(200);
    expect(loadAt(100, profile, 30)).toBe(300);
    expect(loadAt(100, profile, 100)).toBe(300);
  });

  test('ramp with zero duration steps straight to the peak', () => {
    expect(loadAt(100, { kind: 'ramp', peak: 300, startS: 10, durationS: 0 }, 10)).toBe(300);
  });

  test('spike is at peak inside the window and base outside it', () => {
    const profile = { kind: 'spike' as const, peak: 500, startS: 10, durationS: 5 };
    expect(loadAt(100, profile, 12)).toBe(500);
    expect(loadAt(100, profile, 15)).toBe(100);
    expect(loadAt(100, profile, 20)).toBe(100);
  });

  test('wave is at peak at half a period and base at full periods', () => {
    const profile = { kind: 'wave' as const, peak: 300, startS: 10, durationS: 20 };
    expect(loadAt(100, profile, 20)).toBeCloseTo(300);
    expect(loadAt(100, profile, 10)).toBeCloseTo(100);
    expect(loadAt(100, profile, 30)).toBeCloseTo(100);
  });

  test('wave with zero duration returns the base load', () => {
    expect(loadAt(100, { kind: 'wave', peak: 300, startS: 10, durationS: 0 }, 15)).toBe(100);
  });
});
