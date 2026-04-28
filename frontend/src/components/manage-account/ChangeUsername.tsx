import styles from "./change.module.css";
import { useState } from "react";
import { updateUsername } from "../../services/api";
import { useNavigate } from "react-router";
import { useUser } from "../../hooks/useUser";

export function ChangeUsername() {
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const {user, setUser} = useUser();

    const navigate = useNavigate();

    const handleUpdateUsername = async (e: React.SubmitEvent) => {
        e.preventDefault();

        try {
            const data = await updateUsername(username);
            setUser(prev => prev ? {...prev, username: data.username} : null);
            setMessage(data.message || "Username updated successfully")
            setUsername('');
        } catch (err: unknown) {
            if(err instanceof Error) {
                setMessage(err.message)
            } else {
                setMessage('Something went wrong')
            }
        }

    }

    return (
        <section>
            <button onClick={()=> navigate(-1)}>
                <img src="/arrow-left.svg" alt="icon of arrow pointing left" className={styles.back} />
            </button>


            <div><p>PIC HERE</p></div>
            <p>{user?.username}</p>

            <h3>Update Username</h3>
            <form onSubmit={handleUpdateUsername}>
                <input 
                    required
                    type="text" 
                    placeholder="New username" 
                    value={username} 
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setMessage('')
                    }}/>
                <button type="submit">Save Changes</button>
            </form>

            {message && <p>{message}</p>}

        </section>
    )
}