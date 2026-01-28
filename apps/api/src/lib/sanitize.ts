import sanitizeHtml from 'sanitize-html';

export const sanitizeText = (text: string | null | undefined): string => {
    if (typeof text !== 'string') return '';

    return sanitizeHtml(text, {
        allowedTags: [],
        allowedAttributes: {},
    });
};
