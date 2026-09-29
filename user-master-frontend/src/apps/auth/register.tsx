
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import  userService  from "@/pages/user/api";

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        role: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.username.trim()) {
            setMessage("Username is required");
            return;
        }

        if (!form.password.trim()) {
            setMessage("Password is required");
            return;
        }

        if (!form.role) {
            setMessage("Role is required");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await userService.register({
                username: form.username.trim(),
                password: form.password,
                role: form.role,
            });

            setMessage(response);

            setForm({
                username: "",
                password: "",
                role: "",
            });
        } catch (error: any) {
            setMessage(
                error?.response?.data?.message ||
                error?.response?.data ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F8FAFC",
                p: 2,
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 420,
                    p: 4,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        textAlign: "center",
                        mb: 3,
                    }}
                >
                    Register User
                </Typography>

                <Box component="form" onSubmit={handleRegister}>
                    <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        margin="normal"
                    />

                    <TextField
                        fullWidth
                        select
                        label="Role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        margin="normal"
                    >
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                        <MenuItem value="USER">USER</MenuItem>
                        <MenuItem value="HOD">HOD</MenuItem>
                        <MenuItem value="HOD">Management</MenuItem>
                    </TextField>

                    {message && (
                        <Typography
                            sx={{
                                mt: 2,
                                fontSize: "0.9rem",
                                color: message.toLowerCase().includes("success")
                                    ? "success.main"
                                    : "error.main",
                            }}
                        >
                            {message}
                        </Typography>
                    )}

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 3,
                            py: 1.2,
                            borderRadius: 2,
                            fontWeight: 700,
                        }}
                    >
                        {loading ? "Registering..." : "Register"}
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate("/login")}
                        sx={{ mt: 1 }}
                    >
                        Back to Login
                    </Button>
                </Box>
            </Card>
        </Box>
    );
};

export default Register;

