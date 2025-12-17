
/**
 * Normalization Utilities
 */

export function safeNumber(val: any, decimals: number = 2): number | null {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    // If integer, return as is? No, requirements say numbers. Decimals cleaner.
    return Number(num.toFixed(decimals));
}

export function safePct(numerator: any, denominator: any): number | null {
    const num = safeNumber(numerator);
    const den = safeNumber(denominator);
    if (num === null || den === null || den === 0) return null;
    return Number(((num / den) * 100).toFixed(1));
}

export function normalizeTeamAlias(alias: string): string {
    // Map logic if needed (e.g., JAC -> JAX in some systems, but Sportradar is usually JAX)
    // For now, pass through upper case
    return alias.toUpperCase();
}

/**
 * Extracts a safe subset of stats from a raw statistical object.
 * Handles missing keys gracefully.
 */
export function extractStat(source: any, path: string): number | null {
    if (!source) return null;
    const keys = path.split('.');
    let current = source;
    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') return null;
        current = current[key];
    }
    return safeNumber(current);
}

/**
 * Maps Sportradar position strings to our simplified set if needed
 * e.g., 'WR' -> 'WR', 'T' -> 'OL'
 */
export function normalizePosition(pos: string): string {
    if (!pos) return 'UNK';
    return pos.toUpperCase();
}
