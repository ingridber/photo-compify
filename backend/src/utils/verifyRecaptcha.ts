export async function verifyRecaptcha(token: string): Promise<boolean> {
    const secret = process.env.RECAPTCHA_SECRET as string;

    if (!token) return false;

    try {
        const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ secret, response: token }).toString()
        });

        const data = await res.json();
        

        return data.success && data.score >= 0.5;
    } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        return false;
    }
}