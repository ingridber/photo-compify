import { useState } from "react";
import { register } from "../services/api";
import { useNavigate } from "react-router";
const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column" };

const usernameRegex = /^[^\u0080-\uFFFF]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]).+$/;

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export default function RegisterForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const navigate = useNavigate();

    function validateUsername(value: string): string | undefined {
        if (value.length <= 2) return "Username must be longer than 2 characters";
        if (value.length >= 80) return "Username must be less than 80 characters";
        if (!usernameRegex.test(value)) return "Username must contain ASCII characters only";
    }

    function validatePassword(value: string): string | undefined {
        if (value.length < 8) return "Password must be at least 8 characters";
        if (value.length > 128) return "Password must be less than 128 characters";
        if (!passwordRegex.test(value)) return "Password must contain at least 1 capital letter, 1 number, and 1 symbol";
    }

    function validateConfirmPassword(value: string): string | undefined {
        if (value !== password) return "Passwords do not match";
    }

    function handleBlur(field: keyof FormErrors, value: string) {
        let error: string | undefined;
        if (field === "username") error = validateUsername(value);
        if (field === "password") error = validatePassword(value);
        if (field === "confirmPassword") error = validateConfirmPassword(value);
        setErrors(prev => ({ ...prev, [field]: error }));
    }

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        const usernameError = validateUsername(username);
        const passwordError = validatePassword(password);
        const confirmPasswordError = validateConfirmPassword(confirmPassword);

        if (usernameError || passwordError || confirmPasswordError) {
            setErrors({ username: usernameError, password: passwordError, confirmPassword: confirmPasswordError });
            return;
        }

        try {
            const res = await register(email, username, password);
            if (res.status === 201) {
                navigate("/login", {replace: true});
            }
            if (res.status === 409) {
                const data = await res.json();
                if (data.code === "USER_ALREADY_REGISTERED") {
                    setErrors(prev => ({ ...prev, username: "Username is already taken" }));
                }
                return;
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", width: "50%", gap: "1em" }}>
            <label style={labelStyle}>Username
                <input
                    required
                    type="text"
                    placeholder="Enter username.."
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onBlur={e => handleBlur("username", e.target.value)}
                />
                {errors.username && <small style={{ color: "red" }}>{errors.username}</small>}
            </label>
            <label style={labelStyle}>Email
                <input
                    required
                    type="email"
                    placeholder="example@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                {errors.email && <small style={{ color: "red" }}>{errors.email}</small>}
            </label>
            <label style={labelStyle}>Password
                <input
                    required
                    type="password"
                    placeholder="Enter a password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={e => handleBlur("password", e.target.value)}
                />
                <small>At least 1 capital letter, 1 number, and 1 symbol</small>
                {errors.password && <small style={{ color: "red" }}>{errors.password}</small>}
            </label>
            <label style={labelStyle}>Confirm Password
                <input
                    required
                    type="password"
                    placeholder="Enter password again"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onBlur={e => handleBlur("confirmPassword", e.target.value)}
                />
                {errors.confirmPassword && <small style={{ color: "red" }}>{errors.confirmPassword}</small>}
            </label>
            <button type="submit">Register</button>
        </form>
    );
}
