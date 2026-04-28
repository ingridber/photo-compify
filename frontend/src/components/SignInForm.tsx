
import { useState} from "react";
import { login } from "../services/api";
import { useUser } from "../hooks/useUser";

export function SignInForm() {
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const {user, setUser} = useUser();


    const handleSubmit = async (e: React.SubmitEvent ) => {
        e.preventDefault();

        try {
            const data = await login(username, password);
            setMessage(data.message);
            setUser({
                username: data.username,
                profilePicture: data.profilePicture || ''
            });
            setUsername('');
            setPassword('');

        } catch (err) {
            setUser(null);
            if (err instanceof Error) {
                setMessage(err.message);
            } else {
                setMessage('Something went wrong');
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
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <label htmlFor="password">Enter password</label>
                <input 
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Sign In</button>
            </form>

            {message && (
                <p>{message}</p>) }
            {user && <p>Welcome {user.username}</p>}
        </>
    )
};