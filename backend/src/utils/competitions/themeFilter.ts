export const getThemeFilter = (
    themes: string[] | string | undefined
) => {

    // No themes selected
    if(!themes || themes.length === 0) {
        return {};
    }

    // Convert comma-separated string to array
    const themeArray = 
    typeof themes === "string"
        ? themes.split(",")
        : themes;

        return {
            themes: {
                $in: themeArray,
            },
        };
    };