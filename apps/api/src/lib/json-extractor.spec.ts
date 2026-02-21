import { extractJsonArray } from './json-extractor';

describe('extractJsonArray', () => {
    it('should extract a clean JSON array', () => {
        const input = '["Electrician", "Plumber"]';
        const result = extractJsonArray(input);
        expect(result).toEqual(['Electrician', 'Plumber']);
    });

    it('should extract JSON array from Markdown code block', () => {
        const input = 'Here is the list:\n```json\n["Painter", "Roofer"]\n```';
        const result = extractJsonArray(input);
        expect(result).toEqual(['Painter', 'Roofer']);
    });

    it('should extract JSON array from Markdown code block without language identifier', () => {
        const input = '```\n["Mason"]\n```';
        const result = extractJsonArray(input);
        expect(result).toEqual(['Mason']);
    });

    it('should extract JSON array with surrounding text', () => {
        const input = 'Sure, the trades are ["Carpenter"] and that is it.';
        const result = extractJsonArray(input);
        expect(result).toEqual(['Carpenter']);
    });

    it('should extract the first JSON array if multiple are present', () => {
        const input = 'First ["A"], then ["B"]';
        const result = extractJsonArray(input);
        expect(result).toEqual(['A']);
    });

    it('should handle nested arrays', () => {
        const input = 'The result is [["A", "B"], ["C"]]';
        const result = extractJsonArray(input);
        expect(result).toEqual([['A', 'B'], ['C']]);
    });

    it('should handle strings containing brackets', () => {
        const input = '["Start [ Middle ] End"]';
        const result = extractJsonArray(input);
        expect(result).toEqual(['Start [ Middle ] End']);
    });

    it('should return null for invalid JSON', () => {
        const input = 'This is not json: [oops}';
        const result = extractJsonArray(input);
        expect(result).toBeNull();
    });

    it('should return null if no array brackets are found', () => {
        const input = 'Just some text';
        const result = extractJsonArray(input);
        expect(result).toBeNull();
    });

    it('should handle complex output with noise', () => {
        const input = `
            Okay, here is the JSON you requested:
            \`\`\`json
            [
                "Trade A",
                "Trade B"
            ]
            \`\`\`
            Hope this helps!
        `;
        const result = extractJsonArray(input);
        expect(result).toEqual(['Trade A', 'Trade B']);
    });

    it('should handle array with trailing junk inside the candidate window initially', () => {
        // "Candidate" from first [ to last ] is `["A"] junk [2]`
        // This fails parse.
        // It should shrink to `["A"]`.
        const input = '["A"] junk [2]';
        const result = extractJsonArray(input);
        expect(result).toEqual(['A']);
    });
});
