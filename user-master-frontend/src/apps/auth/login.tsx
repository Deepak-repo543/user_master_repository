import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { LockOutlined, PersonOutlined, Visibility, VisibilityOff, } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import userService from "@/pages/user/api";
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!username.trim() && !password) {
            setError("Username and password are required.");
            return;
        }

        if (!username.trim()) {
            setError("Username is required.");
            return;
        }

        if (!password) {
            setError("Password is required.");
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
        if (event.key === "Enter" && !loading) {
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
                background:
                    "linear-gradient(135deg, #F8FAFC 0%, #EEF4FF 100%)",
                px: 2,
                position: "relative",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    width: 320,
                    height: 320,
                    borderRadius: "50%",
                    background: "rgba(59, 130, 246, 0.08)",
                    top: -140,
                    right: -100,
                }}
            />

            <Box
                sx={{
                    position: "absolute",
                    width: 260,
                    height: 260,
                    borderRadius: "50%",
                    background: "rgba(99, 102, 241, 0.06)",
                    bottom: -120,
                    left: -80,
                }}
            />

            <Card
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    borderRadius: 3,
                    backgroundColor: "rgba(255, 255, 255, 0.96)",
                    border: "1px solid rgba(226, 232, 240, 0.9)",
                    boxShadow:
                        "0 20px 50px rgba(15, 23, 42, 0.10)",
                    position: "relative",
                    zIndex: 1,
                    overflow: "visible",
                }}
            >
                <CardContent
                    sx={{
                        p: { xs: 3, sm: 4.5 },
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 2.5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 58,
                                height: 58,
                                borderRadius: 2.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background:
                                    "linear-gradient(135deg, #3B82F6, #2563EB)",
                                boxShadow:
                                    "0 10px 24px rgba(37, 99, 235, 0.25)",
                            }}
                        >
                            <PersonOutlined
                                sx={{
                                    color: "#FFFFFF",
                                    fontSize: 30,
                                }}
                            />
                        </Box>
                    </Box>

                    <Typography
                        component="h1"
                        sx={{
                            textAlign: "center",
                            color: "#172033",
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            letterSpacing: "-0.3px",
                        }}
                    >
                        Welcome to User Master
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.7,
                            mb: 3.5,
                            textAlign: "center",
                            color: "#64748B",
                            fontSize: "0.88rem",
                        }}
                    >
                        Sign in to access your dashboard
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            onClose={() => setError("")}
                            sx={{
                                mb: 2.5,
                                borderRadius: 1.5,
                                fontSize: "0.82rem",
                                alignItems: "center",
                            }}
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
                        disabled={loading}
                        sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 1.5,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    borderColor: "#3B82F6",
                                },
                                "&.Mui-focused": {
                                    boxShadow:
                                        "0 0 0 3px rgba(59, 130, 246, 0.10)",
                                },
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlined
                                            sx={{
                                                color: "#94A3B8",
                                                fontSize: 21,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        autoComplete="current-password"
                        disabled={loading}
                        sx={{
                            mb: 1,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 1.5,
                                transition: "all 0.2s ease",
                                "&.Mui-focused": {
                                    boxShadow:
                                        "0 0 0 3px rgba(59, 130, 246, 0.10)",
                                },
                            },
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlined
                                            sx={{
                                                color: "#94A3B8",
                                                fontSize: 21,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() =>
                                                setShowPassword(
                                                    (prev) => !prev,
                                                )
                                            }
                                            edge="end"
                                            disabled={loading}
                                            sx={{
                                                color: "#64748B",
                                                "&:hover": {
                                                    color: "#2563EB",
                                                    backgroundColor:
                                                        "rgba(37, 99, 235, 0.06)",
                                                },
                                            }}
                                        >
                                            {showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                            console.log("LOGIN BUTTON CLICKED");
                            handleLogin();
                        }}
                        disabled={loading}
                        sx={{
                            mt: 3,
                            height: 46,
                            borderRadius: 1.5,
                            textTransform: "none",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            background:
                                "linear-gradient(135deg, #3B82F6, #2563EB)",
                            boxShadow:
                                "0 8px 18px rgba(37, 99, 235, 0.22)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                background:
                                    "linear-gradient(135deg, #2563EB, #1D4ED8)",
                                boxShadow:
                                    "0 10px 22px rgba(37, 99, 235, 0.28)",
                                transform: "translateY(-1px)",
                            },
                            "&:disabled": {
                                background: "#CBD5E1",
                            },
                        }}
                    >
                        {loading ? (
                            <CircularProgress
                                size={22}
                                sx={{ color: "#FFFFFF" }}
                            />
                        ) : (
                            "Sign In"
                        )}
                    </Button>

                    <Typography
                        sx={{
                            mt: 3,
                            textAlign: "center",
                            color: "#94A3B8",
                            fontSize: "0.72rem",
                        }}
                    >
                        Secure access to User Master
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
