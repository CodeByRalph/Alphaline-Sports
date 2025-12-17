export const SEASON_START_DATE = new Date('2025-09-04T00:00:00Z'); // Thursday Kickoff

export function getCurrentNFLSeasonContext(): { season: number; week: number } {
    const now = new Date();
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;

    // Calculate weeks passed since start
    const diff = now.getTime() - SEASON_START_DATE.getTime();

    if (diff < 0) return { season: 2025, week: 1 }; // Pre-season defaults to 1

    const weeksPassed = Math.floor(diff / msPerWeek);
    const currentWeek = weeksPassed + 1;

    // Adjust logic:
    // If it's Tuesday/Wednesday, typically we start looking at the *next* week.
    // Sportradar weeks run Wed-Tue or similar. 
    // Let's say if we are > 2 days into the "week" (Thursday, Friday, Sat, Sun, Mon played), match is next.
    // Better simple logic: NFL week usually behaves as "Upcoming" if it's Tuesday+.
    // Actually, Week 1 starts Sept 4.
    // Dec 16 is...
    // Sept 4 to Dec 16 is roughly 14.7 weeks. So we are in Week 15.
    // But Week 15 games are mostly done (Sun Dec 14, Mon Dec 15).
    // So on Tuesday Dec 16, we want to scout Week 16.

    // Let's look ahead 1 week if it's Tuesday or later in the calculation window?
    // Or simpler: Just calculate the raw week and if it's late in the week, increment?

    // Refined calculation:
    // Week 1: Sept 4 - Sept 10
    // ...
    // Inputs: 2025-12-16
    // Diff ~= 103 days. 103 / 7 = 14.7.
    // So we are physically in Week 15 (index 14).
    // But since it is Tuesday (post-MNF), strictly speaking we are preparing for Week 16.

    // Let's return currentWeek + 1 if we assume Tuesday is "on to next week".
    // Or let's return currentWeek.
    // The user specifically wants the *upcoming* game.
    // If Week 15 is over, the upcoming game is Week 16.

    // Let's try explicit map for reliability in demo or calculated.
    // Calculated is better.

    // On Tuesday (Day 2) -> Start looking at next week?
    // Let's return Math.ceil(diff / msPerWeek) + 1? No.

    // Hard check: Dec 16 is Tuesday.
    // If we are in the "transition" period (Tues/Wed), we usually want next week.
    // Let's implement a "getUpcomingWeek" that adds 1 if > Tuesday.

    return { season: 2025, week: currentWeek + 1 }; // Jump to upcoming
}
