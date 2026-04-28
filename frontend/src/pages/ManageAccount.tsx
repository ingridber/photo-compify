import { Link } from "react-router"
import { useUser } from "../hooks/useUser"

export function ManageAccount() {

    const {user} = useUser();

    return(
        <div>
            <h2>Manage Account</h2>

            <p>{user ? `${user}` : ''}</p>
            <div><p>PIC HERE</p></div>

            <Link to="change-picture">
                <p>Change Profile Picture</p>
            </Link>

            <Link to="change-username">
                <button>Change Username</button>
            </Link>

            <Link to="change-email">
                <button>Change Email</button>
            </Link>

            <Link to="change-password">
                <button>Change Password</button>
            </Link>

            <article>
                <p>Need a break?</p>
                <Link to="logout">
                    <p>Sign Out</p>
                </Link>
            </article>

            <article>
                <p>Wanna break up? :-(</p>
                <Link to="delete-account">
                    <p>Delete Account</p>
                </Link>
            </article>

            <Link to="/">
                <button>Back</button>
            </Link>

        </div>    
    )
}