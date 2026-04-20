
import { useState} from "react";
import { login } from "../services/api";

export function SignInForm() {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [user, setUser] = useState('');


    const handleSubmit = async (e: React.SubmitEvent ) => {
        e.preventDefault();

        try {
            const data = await login(email, password);
            console.log(`${data.code}`)
            setMessage(data.message)
            setUser(data.username)
            setEmail('');
            setPassword('');

        } catch (err) {
            console.log(err);
            setUser('');
            if (err instanceof Error) {
                setMessage(err.message)
            } else {
                setMessage('Something went wrong')
            }
        };


    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Enter username</label>
                <input 
                    id="username"
                    type="text"
                    placeholder="Plz enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label htmlFor="password">Enter password</label>
                <input 
                    id="password"
                    type="password"
                    placeholder="Plz enter your secret"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Sign In</button>
            </form>

            {message && (
                <p>{message} {user ? `Welcome ${user}` : ''}</p>
            )}
        </>
    )
};