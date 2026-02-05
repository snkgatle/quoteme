/**
 * Extracts a JSON array from a string, handling Markdown code blocks and common formatting issues.
 * This is useful for extracting structured data from LLM responses.
 *
 * @param text The input string containing a JSON array.
 * @returns The parsed array, or null if no valid array is found.
 */
export function extractJsonArray(text: string): any[] | null {
    if (!text) return null;

    // 1. Remove Markdown code blocks if present
    // Matches ```json ... ``` or just ``` ... ```
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
        text = codeBlockMatch[1];
    }

    // 2. Find the first '['
    const firstOpen = text.indexOf('[');
    if (firstOpen === -1) return null;

    // 3. Find the last ']'
    let lastClose = text.lastIndexOf(']');
    if (lastClose <= firstOpen) return null;

    // 4. Try parsing the substring from first '[' to last ']'
    // If it fails, shrink from the right until it works or we run out of ']'
    // This handles cases like `["item"] some trailing text` or multiple arrays where we want the first one.

    let currentLastClose = lastClose;

    while (currentLastClose > firstOpen) {
        const candidate = text.substring(firstOpen, currentLastClose + 1);
        try {
            const parsed = JSON.parse(candidate);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            // If it parses but is not an array (unlikely given it starts with [), continue.
        } catch (e) {
            // Parsing failed, try finding the previous ']'
        }

        currentLastClose = text.lastIndexOf(']', currentLastClose - 1);
    }

    return null;
}
