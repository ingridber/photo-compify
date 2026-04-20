
import { useState } from "react";
import { login } from "../services/api";

export function SignInForm() {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.SubmitEvent ) => {
        e.preventDefault();

        try {
            const data = await login(email, password);
            console.log("Inloggad: " + data.username)
        } catch (err) {
            console.log(`Failed login, error: ${err}`);
        };
    };

    return (
        <>
            {/* <form action=""> */}
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Enter username (email)</label>
                <input 
                    id="username"
                    type="text"
                    placeholder="Plz enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label htmlFor="username">Enter username (email)</label>
                <input 
                    id="password"
                    type="password"
                    placeholder="Plz enter your secret"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Sign In</button>
            </form>
        </>
    )
};