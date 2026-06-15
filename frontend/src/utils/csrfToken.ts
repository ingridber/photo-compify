let token = "";
export const setCsrfToken = (t: string) => { token = t; };
export const getCsrfToken = () => token;
