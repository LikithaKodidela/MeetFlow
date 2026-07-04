import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import VideocamIcon from '@mui/icons-material/Videocam';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Box, Tooltip, CircularProgress } from '@mui/material';

export default function History() {
    const { getHistoryOfUser, deleteFromHistory } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [deletingId, setDeletingId] = useState(null); // track which entry is being deleted
    const routeTo = useNavigate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (err) {
                console.error('Failed to fetch history:', err);
            }
        }
        fetchHistory();
    }, [])

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const handleDelete = async (meetingId) => {
        try {
            setDeletingId(meetingId);
            await deleteFromHistory(meetingId);
            // Remove from local state instantly (no re-fetch needed)
            setMeetings(prev => prev.filter(m => m._id !== meetingId));
        } catch (err) {
            console.error('Failed to delete meeting:', err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: '#f5f7ff',
            px: { xs: 2, sm: 4 },
            py: { xs: 2, sm: 3 },
        }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 3,
                pb: 2,
                borderBottom: '1px solid #e0e7ff',
            }}>
                <IconButton onClick={() => routeTo("/home")} size="small">
                    <HomeIcon />
                </IconButton>
                <Typography variant="h5" sx={{
                    fontWeight: 700,
                    color: '#1e1b4b',
                    fontSize: { xs: '1.2rem', sm: '1.5rem' }
                }}>
                    Meeting History
                </Typography>
                {meetings.length > 0 && (
                    <Typography sx={{
                        ml: 1, px: 1.5, py: 0.3,
                        background: '#ede9fe',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#6366f1',
                    }}>
                        {meetings.length}
                    </Typography>
                )}
            </Box>

            {/* Meeting cards */}
            {meetings.length !== 0 ? (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxWidth: 600,
                    mx: 'auto',
                }}>
                    {meetings.map((e) => (
                        <Card
                            key={e._id}
                            variant="outlined"
                            sx={{
                                borderRadius: '12px',
                                border: '1.5px solid #e0e7ff',
                                boxShadow: '0 2px 8px rgba(79,70,229,0.06)',
                                opacity: deletingId === e._id ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: '#6366f1',
                                    boxShadow: '0 4px 16px rgba(79,70,229,0.12)',
                                },
                            }}
                        >
                            <CardContent sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                py: '12px !important',
                                px: '16px !important',
                            }}>
                                {/* Icon */}
                                <Box sx={{
                                    width: 40, height: 40,
                                    borderRadius: '10px',
                                    background: '#ede9fe',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <VideocamIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                                </Box>

                                {/* Meeting info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 700,
                                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                                        color: '#3730a3',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {e.meetingCode}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: '#6b7280', mt: 0.25 }}>
                                        {formatDate(e.date)}
                                    </Typography>
                                </Box>

                                {/* Delete button */}
                                <Tooltip title="Delete this entry" placement="left">
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDelete(e._id)}
                                            disabled={deletingId === e._id}
                                            sx={{
                                                color: '#ef4444',
                                                background: '#fff1f2',
                                                borderRadius: '8px',
                                                width: 34, height: 34,
                                                flexShrink: 0,
                                                '&:hover': {
                                                    background: '#fee2e2',
                                                    transform: 'scale(1.1)',
                                                },
                                                transition: 'all 0.18s ease',
                                            }}
                                        >
                                            {deletingId === e._id
                                                ? <CircularProgress size={16} sx={{ color: '#ef4444' }} />
                                                : <DeleteIcon fontSize="small" />
                                            }
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', mt: 8, color: '#9ca3af' }}>
                    <VideocamIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
                    <Typography variant="body1">No meeting history yet.</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Start a meeting to see it here.
                    </Typography>
                </Box>
            )}
        </Box>
    )
}