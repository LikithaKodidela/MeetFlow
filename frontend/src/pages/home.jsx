import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField, Snackbar, Alert, Tooltip, Divider } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [copiedWhat, setCopiedWhat] = useState(null);

    const { addToUserHistory } = useContext(AuthContext);

    const getMeetingLink = (code) => `${window.location.origin}/${code}`;

    const generateMeetingCode = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                code += chars[Math.floor(Math.random() * chars.length)];
            }
            if (i < 2) code += '-';
        }
        setGeneratedCode(code);
        return code;
    };

    const handleNewMeeting = () => generateMeetingCode();

    const handleStartMeeting = async () => {
        if (!generatedCode) return;
        await addToUserHistory(generatedCode);
        navigate(`/${generatedCode}`);
    };

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        let raw = meetingCode.trim();
        try {
            const url = new URL(raw);
            raw = url.pathname.replace(/^\//, '');
        } catch (_) { }
        if (!raw) return;
        await addToUserHistory(raw);
        navigate(`/${raw}`);
    };

    const handleCopyLink = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(getMeetingLink(generatedCode));
            setCopiedWhat('link');
        }
    };

    const handleCopyCode = () => {
        if (generatedCode) {
            navigator.clipboard.writeText(generatedCode);
            setCopiedWhat('code');
        }
    };

    return (
        <>
            {/* Navbar */}
            <div className="navBar">
                <div className="navBrand">
                    <h2>MeetFlow</h2>
                    <p>Meet. Talk. Collaborate.</p>
                </div>
                <div className="navBarActions">
                    <div className="navBarHistory" onClick={() => navigate("/history")}>
                        <IconButton onClick={() => navigate("/history")}>
                            <RestoreIcon />
                        </IconButton>
                        <p>History</p>
                    </div>
                    <Button
                        className="navBarLogout"
                        onClick={() => { localStorage.removeItem("token"); navigate("/auth"); }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main layout */}
            <div className="meetContainer">
                <div className="leftPanel">

                    {/* Section 1 — New Meeting */}
                    <div>
                        <h2 style={{ margin: '0 0 6px' }}>Start a New Meeting</h2>
                        <p style={{ color: "#888", margin: '0 0 20px', fontSize: "0.9rem" }}>
                            Generate a link and share it — anyone with the link can join.
                        </p>

                        <Button
                            onClick={handleNewMeeting}
                            variant='contained'
                            startIcon={<AddIcon />}
                        >
                            New Meeting
                        </Button>

                        {/* Invite panel — shown after code generated */}
                        {generatedCode && (
                            <div style={{
                                background: '#f5f7ff',
                                border: '1.5px solid #c7d2fe',
                                borderRadius: '14px',
                                padding: '20px',
                                marginTop: '20px',
                                maxWidth: '440px',
                            }}>
                                <p style={{
                                    margin: '0 0 14px',
                                    fontSize: '0.75rem',
                                    color: '#6366f1',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                }}>
                                    Your meeting is ready
                                </p>

                                {/* Link row */}
                                <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: '#555' }}>Meeting link</p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e7ff',
                                    padding: '8px 12px',
                                    marginBottom: '16px',
                                }}>
                                    <LinkIcon style={{ color: '#6366f1', fontSize: 16, flexShrink: 0 }} />
                                    <span style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.82rem',
                                        color: '#3730a3',
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {getMeetingLink(generatedCode)}
                                    </span>
                                    <Tooltip title="Copy meeting link">
                                        <IconButton size="small" onClick={handleCopyLink} style={{ flexShrink: 0 }}>
                                            <ContentCopyIcon fontSize="small" style={{ color: '#6366f1' }} />
                                        </IconButton>
                                    </Tooltip>
                                </div>

                                {/* Code row */}
                                <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#555' }}>Or share just the code</p>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '20px',
                                }}>
                                    <span style={{
                                        fontFamily: 'monospace',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        color: '#3730a3',
                                        letterSpacing: '2px',
                                        background: '#e0e7ff',
                                        padding: '4px 14px',
                                        borderRadius: '6px',
                                    }}>
                                        {generatedCode}
                                    </span>
                                    <Tooltip title="Copy code">
                                        <IconButton size="small" onClick={handleCopyCode}>
                                            <ContentCopyIcon style={{ fontSize: 16, color: '#6366f1' }} />
                                        </IconButton>
                                    </Tooltip>
                                </div>

                                <Button
                                    onClick={handleStartMeeting}
                                    variant="contained"
                                    fullWidth
                                    style={{ borderRadius: 8, padding: '10px 0', fontWeight: 600 }}
                                >
                                    Start Meeting Now
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Divider between sections */}
                    <Divider style={{ margin: '32px 0', maxWidth: 440 }}>
                        <span style={{ color: '#aaa', fontSize: '0.8rem', padding: '0 10px' }}>OR</span>
                    </Divider>

                    {/* Section 2 — Join Meeting */}
                    <div>
                        <h2 style={{ margin: '0 0 6px' }}>Join a Meeting</h2>
                        <p style={{ color: "#888", margin: '0 0 20px', fontSize: "0.9rem" }}>
                            Paste a meeting link or enter a code.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', maxWidth: 440 }}>
                            <TextField
                                onChange={e => setMeetingCode(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleJoinVideoCall()}
                                id="join-meeting-input"
                                label="Meeting Link or Code"
                                variant="outlined"
                                value={meetingCode}
                                placeholder="Paste link or type code"
                                style={{ flex: 1 }}
                            />
                            <Button
                                onClick={handleJoinVideoCall}
                                variant='contained'
                                style={{ minWidth: 80, borderRadius: 8 }}
                            >
                                Join
                            </Button>
                        </div>
                    </div>

                </div>

                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>

            <Snackbar
                open={!!copiedWhat}
                autoHideDuration={2500}
                onClose={() => setCopiedWhat(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setCopiedWhat(null)}>
                    {copiedWhat === 'link'
                        ? 'Meeting link copied! Share it with participants.'
                        : 'Meeting code copied!'}
                </Alert>
            </Snackbar>
        </>
    )
}

export default withAuth(HomeComponent)
