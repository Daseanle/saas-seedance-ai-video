
import axios from 'axios';

interface Suggestion {
    keyword: string;
    source: string; // "a", "b", "c"... or "root"
}

// Scrape Google Autocomplete
// Method: Method 6 from "热词挖掘方法.md"
export async function scrapeGoogleSuggest(seed: string): Promise<Suggestion[]> {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const queries = [seed, ...alphabet.map(char => `${seed} ${char}`)];

    // Create tasks
    const tasks = queries.map(async (q) => {
        try {
            // Use client=chrome to get JSON format
            const url = `http://google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}&hl=en`;
            const response = await axios.get(url, { timeout: 3000 });
            // Response format: ["query", ["sugg1", "sugg2", ...], ...]
            const suggestions: string[] = response.data[1] || [];

            // Map to object
            return suggestions.map(s => ({
                keyword: s,
                source: q === seed ? "Root" : q.replace(seed, '').trim()
            }));
        } catch (e) {
            return [];
        }
    });

    // Run in parallel (Google Autocomplete is fast and usually allows high concurrency)
    const results = await Promise.all(tasks);

    // Flatten and Deduplicate
    const allSuggestions = results.flat();
    const uniqueMap = new Map();

    allSuggestions.forEach(s => {
        if (!uniqueMap.has(s.keyword)) {
            uniqueMap.set(s.keyword, s);
        }
    });

    return Array.from(uniqueMap.values());
}
