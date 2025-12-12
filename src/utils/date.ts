export const toHTMLDateString = (value: string | number | Date | null | undefined): string | undefined => {
    if (!value) return undefined;
    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return undefined;
        return date.toISOString().split('T')[0];
    } catch {
        return undefined;
    }
};
