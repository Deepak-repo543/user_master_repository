
import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    TextField,
    Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import userService from "@/pages/user/api";
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!username.trim() || !password) {
            setError("Username and password are required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const loginResponse = await userService.login({
                username: username.trim(),
                password,
            });

            const decodedToken: any = jwtDecode(loginResponse.token);

            localStorage.setItem(
                "user",
                JSON.stringify({
                    username: decodedToken.sub,
                    role: decodedToken.role,
                    roles: decodedToken.roles,
                }),
            );
            sessionStorage.setItem("justLoggedIn", "true");
            const from = location.state?.from?.pathname || "/dashboard";
            navigate(from, { replace: true });
        } catch (error: any) {
            setError(
                error?.response?.data?.message ||
                "Invalid username or password.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F8FAFC",
                px: 2,
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 400,
                    borderRadius: 2,
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Typography
                        component="h1"
                        variant="h6"
                        sx={{
                            textAlign: "center",
                            color: "#172033",
                            fontWeight: 700,
                        }}
                    >
                        Welcome to User Master
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.5,
                            mb: 3,
                            textAlign: "center",
                            color: "#64748B",
                            fontSize: "0.9rem",
                        }}
                    >
                        Please login to continue
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2, borderRadius: 1 }}
                        >
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(event) => {
                            setUsername(event.target.value);
                            setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        autoComplete="username"
                        autoFocus
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        autoComplete="current-password"
                        margin="normal"
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleLogin}
                        disabled={loading}
                        sx={{
                            mt: 3,
                            height: 44,
                            borderRadius: 1.5,
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={22} color="inherit" />
                        ) : (
                            "Login"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;

