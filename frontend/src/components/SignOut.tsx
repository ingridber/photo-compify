import { useNavigate } from "react-router";
import { useUser } from "../hooks/useUser";
import { useEffect, useState } from "react";
import { logout } from "../services/api";
import { Throbber } from "./user-feedback/Throbber";

export function SignOut() {
    const navigate = useNavigate();
    const {user, setUser} = useUser();
    const [username, setUsername] = useState('');

    useEffect(() => {
        const executeLogout = async () => {

            if(!user){ navigate("/")};

            try {
                setUsername(user?.username || 'User');
                await logout();
                setUser(null);
                setTimeout(() => {
                    navigate("/");
                }, 1500);
            } catch (err) {
                console.log("Log out: " + err);
            }; 
        };
        executeLogout();
    }, []);

    return <Throbber 
                    message={`${username} succesfully signed out`}
                    action="Redirecting..."
                />
}