import { getStreak } from '../utils';

const TODAY = '2026-03-02';

describe('getStreak', () => {
  it('is 0 with no submissions', () => {
    expect(getStreak([], TODAY)).toEqual({ current: 0, longest: 0, submittedToday: false });
  });

  it('counts consecutive days ending today', () => {
    const streak = getStreak(['2026-03-02', '2026-03-01', '2026-02-28'], TODAY);
    expect(streak).toEqual({ current: 3, longest: 3, submittedToday: true });
  });

  it('keeps the streak alive until today ends (counts up to yesterday)', () => {
    const streak = getStreak(['2026-03-01', '2026-02-28'], TODAY);
    expect(streak.current).toBe(2);
    expect(streak.submittedToday).toBe(false);
  });

  it('breaks after a missed day', () => {
    expect(getStreak(['2026-02-28', '2026-02-27'], TODAY).current).toBe(0);
  });

  it('crosses month boundaries (Feb 28 → Mar 1 in a non-leap year)', () => {
    expect(getStreak(['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02'], TODAY).current).toBe(4);
  });

  it('remembers the longest run separately from the current one', () => {
    const dates = ['2026-02-10', '2026-02-11', '2026-02-12', '2026-02-13', '2026-03-02'];
    expect(getStreak(dates, TODAY)).toEqual({ current: 1, longest: 4, submittedToday: true });
  });

  it('ignores duplicates and time parts', () => {
    expect(getStreak(['2026-03-02T08:00:00Z', '2026-03-02', '2026-03-01'], TODAY).current).toBe(2);
  });
});
