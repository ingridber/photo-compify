export default function RegisterForm(){
    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
    }

    const labelStyle: React.CSSProperties = {display: "flex", flexDirection: "column"}

    return (
        <form onSubmit={(e) => handleSubmit(e)} style={{display: "flex", flexDirection: "column", width: "50%", gap: "1em"}}>
            <label style={labelStyle}>Username
                <input type="text" placeholder="Enter username.."/>
            </label>
            <label style={labelStyle}>Email
                <input type="email" placeholder="example@example.com"/>
            </label>
            <label style={labelStyle}>Password
                <input type="password" placeholder="Enter a password"/>
                <small>At least 1 capital letter, 1 number, and 1 symbol</small>
            </label>
            <label style={labelStyle}>Confirm Password
                <input type="password" placeholder="Enter password again"/>
            </label>
            <button type="submit">Register</button>
        </form>
    )
}
