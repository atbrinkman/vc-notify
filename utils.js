export const safeJsonParse = (string) => {
    try {
        return JSON.parse(string);
    } catch (e) {
        console.error(e);
        return null;
    }
};
