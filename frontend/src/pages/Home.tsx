
import { useUser } from "../hooks/useUser";
// import { DisplayProfilePicture } from "../components/display-profile-picture/DisplayProfilePicture";
import { DisplayLogo } from "../components/display-profile-picture/DisplayProfilePicture";

import LandingPage from "../components/Landingpage/landingpage";
import HamburgerMenu from "../components/nav-bar/HamburgerMenu";

export function Home() {

    const {user} = useUser();
    

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <HamburgerMenu/>
            <nav>
                
            </nav>

            <div style= {{width: "12rem", margin: "auto", paddingTop: "2rem",}}>
                <DisplayLogo text={true} />
            </div>

            <h1>{`Welcome ${user?.username ? user.username.toLocaleUpperCase() : 'Stranger'} <3`}</h1>

            <LandingPage/>
        </div>
    )
}
