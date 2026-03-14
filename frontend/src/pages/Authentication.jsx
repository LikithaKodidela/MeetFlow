import * as React from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import { AuthContext } from '../contexts/AuthContext.jsx';

const createWallpaper = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const authWallpapers = [
    createWallpaper(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600">
            <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#fde7dc"/>
                    <stop offset="42%" stop-color="#f6c6bc"/>
                    <stop offset="100%" stop-color="#d58ca1"/>
                </linearGradient>
                <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="18"/>
                </filter>
            </defs>
            <rect width="1200" height="1600" fill="url(#sky)"/>
            <circle cx="600" cy="280" r="170" fill="#fff8f3" opacity="0.62" filter="url(#blur)"/>
            <path d="M0 980 C170 890 310 860 470 900 C650 950 760 900 920 840 C1020 804 1100 790 1200 812 L1200 1600 L0 1600 Z" fill="#efb0b0" opacity="0.66"/>
            <path d="M0 1110 C170 1010 350 980 540 1028 C710 1070 880 1020 1200 900 L1200 1600 L0 1600 Z" fill="#df8f95" opacity="0.72"/>
            <path d="M0 1250 C170 1160 370 1130 560 1178 C760 1230 930 1170 1200 1040 L1200 1600 L0 1600 Z" fill="#c46d79" opacity="0.78"/>
            <path d="M0 1380 C230 1260 420 1240 640 1300 C820 1348 980 1308 1200 1180 L1200 1600 L0 1600 Z" fill="#9e5368"/>
        </svg>
    `),
    createWallpaper(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600">
            <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#7ea3ff"/>
                    <stop offset="38%" stop-color="#5f82de"/>
                    <stop offset="100%" stop-color="#1d285f"/>
                </linearGradient>
                <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="16"/>
                </filter>
            </defs>
            <rect width="1200" height="1600" fill="url(#sky)"/>
            <circle cx="860" cy="230" r="120" fill="#d7e4ff" opacity="0.3" filter="url(#blur)"/>
            <path d="M0 920 C170 830 330 820 510 860 C700 904 870 860 1200 760 L1200 1600 L0 1600 Z" fill="#607ac7" opacity="0.58"/>
            <path d="M0 1045 C180 940 360 930 540 980 C740 1035 900 980 1200 860 L1200 1600 L0 1600 Z" fill="#4f67af" opacity="0.72"/>
            <path d="M0 1190 C170 1080 360 1060 560 1120 C730 1170 920 1120 1200 1000 L1200 1600 L0 1600 Z" fill="#33457e" opacity="0.84"/>
            <path d="M0 1350 C180 1230 390 1210 600 1280 C760 1332 930 1280 1200 1160 L1200 1600 L0 1600 Z" fill="#1e285c"/>
        </svg>
    `),
    createWallpaper(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600">
            <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#ffd08a"/>
                    <stop offset="38%" stop-color="#ee8e6f"/>
                    <stop offset="100%" stop-color="#3f356f"/>
                </linearGradient>
            </defs>
            <rect width="1200" height="1600" fill="url(#sky)"/>
            <path d="M0 910 C150 830 300 820 500 868 C690 916 850 870 1200 748 L1200 1600 L0 1600 Z" fill="#62508e" opacity="0.42"/>
            <path d="M0 1030 C170 930 350 920 530 968 C720 1018 890 980 1200 848 L1200 1600 L0 1600 Z" fill="#4d427f" opacity="0.62"/>
            <path d="M0 1180 C190 1070 360 1060 560 1116 C750 1170 920 1120 1200 1000 L1200 1600 L0 1600 Z" fill="#382f67" opacity="0.82"/>
            <path d="M0 1340 C210 1215 390 1210 610 1280 C790 1336 950 1286 1200 1170 L1200 1600 L0 1600 Z" fill="#261f53"/>
        </svg>
    `),
];

export default function Authentication() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [heroImage, setHeroImage] = React.useState(authWallpapers[0]);
    const authContext = React.useContext(AuthContext);
    const { handleRegister, handleLogin } = authContext ?? {};

    React.useEffect(() => {
        const pickedWallpaper = authWallpapers[Math.floor(Math.random() * authWallpapers.length)];
        setHeroImage(pickedWallpaper);
    }, []);

    const handleAuth = async () => {
        if (!handleLogin || !handleRegister) {
            setError("Authentication provider is not available.");
            return;
        }

        if (!username.trim() || !password.trim() || (formState === 1 && !name.trim())) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            if (formState === 0) {
                await handleLogin(username.trim(), password);
                return;
            }

            const result = await handleRegister(name.trim(), username.trim(), password);
            setName("");
            setUsername("");
            setPassword("");
            setMessage(result || "User Registered");
            setOpen(true);
            setFormState(0);
        } 
        catch (err) 
        {
            const nextMessage = err?.response?.data?.message || "Something went wrong";
            setError(nextMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                bgcolor: '#f3f4f6',
            }}
        >
            <CssBaseline />
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    flex: '1 1 58%',
                    overflow: 'hidden',
                    position: 'relative',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    p: 5,
                    backgroundColor: '#d9dee8',
                    backgroundImage: `url("${heroImage}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        px: 3,
                        py: 2.5,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.24)',
                        color: '#ffffff',
                        maxWidth: 260,
                    }}
                >
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 999,
                            backgroundColor: 'rgba(255,255,255,0.28)',
                            fontSize: 12,
                            fontWeight: 900,
                            letterSpacing: '0.22em',
                            textTransform: 'uppercase',
                            color: '#fff8f3',
                            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
                        }}
                    >
                        MeetFlow
                    </Box>
                    <Box
                        sx={{
                            mt: 1.25,
                            fontSize: 32,
                            lineHeight: 1.15,
                            fontWeight: 700,
                        }}
                    >
                        Meet. Talk.
                        <br />
                        Collaborate.
                    </Box>
                </Box>
            </Box>
            <Box
                component={Paper}
                elevation={6}
                square
                sx={{
                    flex: { xs: '1 1 auto', md: '1 1 42%' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        width: '100%',
                        maxWidth: 420,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        A
                    </Avatar>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant={formState === 0 ? "contained" : "text"} onClick={() => setFormState(0)}>
                            Sign In
                        </Button>
                        <Button variant={formState === 1 ? "contained" : "text"} onClick={() => setFormState(1)}>
                            Sign Up
                        </Button>
                    </Box>

                    <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                        {formState === 1 ? (
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="full-name"
                                label="Full Name"
                                name="full-name"
                                value={name}
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                            />
                        ) : null}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            value={username}
                            autoFocus={formState === 0}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {error ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                            </Alert>
                        ) : null}

                        <Button
                            type="button"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={handleAuth}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Please wait..." : formState === 0 ? "Login" : "Register"}
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                onClose={() => setOpen(false)}
            />
        </Box>
    );
}
