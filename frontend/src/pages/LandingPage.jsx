import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

export default function Landing() {
    const router = useNavigate();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [meetingCode, setMeetingCode] = useState('');
    const [error, setError] = useState('');

    const handleJoinClick = () => {
        setMeetingCode('');
        setError('');
        setShowJoinModal(true);
    };

    const handleJoinSubmit = (e) => {
        e.preventDefault();

        let raw = meetingCode.trim();
        if (!raw) {
            setError('Please enter a meeting code or link.');
            return;
        }

        // Support full URLs — extract just the path/code part
        try {
            const url = new URL(raw);
            raw = url.pathname.replace(/^\//, '');
        } catch (_) { /* not a URL, treat as raw code */ }

        if (!raw) {
            setError('Invalid meeting code.');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            // Not logged in — send to auth and remember where to go after login
            sessionStorage.setItem('pendingMeeting', raw);
            router('/auth');
        } else {
            // Already logged in — go straight to the meeting
            router(`/${raw}`);
        }
    };

    const handleModalClose = (e) => {
        if (e.target === e.currentTarget) {
            setShowJoinModal(false);
        }
    };

    return (
        <div className='landingPageContainer'>
            <nav>
                <div className='navHeader'>
                    <h2>MeetFlow </h2>
                </div>
                <div className='navlist'>
                    <p onClick={handleJoinClick}>Join Meeting</p>

                    <p onClick={() => { router("/auth") }}>Sign Up</p>

                    <div onClick={() => { router("/auth") }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1><span style={{ color: "#FF9839" }}>Connect</span> Face-to-Face, Anytime</h1>

                    <p>Instant video meetings that feel real.</p>
                    <div role="button">
                        <Link to={"/auth"}>Start Meeting</Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png" alt="" />
                </div>
            </div>

            {/* ── Join Meeting Modal (Zoom-style) ── */}
            {showJoinModal && (
                <div className="joinModalOverlay" onClick={handleModalClose}>
                    <div className="joinModalCard">
                        {/* Close button */}
                        <button
                            className="joinModalClose"
                            onClick={() => setShowJoinModal(false)}
                            aria-label="Close"
                        >
                            &#x2715;
                        </button>

                        <div className="joinModalIcon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M4 8h11a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"
                                    stroke="#FF9839" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h2 className="joinModalTitle">Join a Meeting</h2>
                        <p className="joinModalSub">Enter the meeting code or paste a meeting link to join.</p>

                        <form onSubmit={handleJoinSubmit} className="joinModalForm">
                            <input
                                className={`joinModalInput${error ? ' joinModalInputError' : ''}`}
                                type="text"
                                placeholder="Meeting code or link (e.g. abc-defg-hij)"
                                value={meetingCode}
                                onChange={e => { setMeetingCode(e.target.value); setError(''); }}
                                autoFocus
                            />
                            {error && <p className="joinModalError">{error}</p>}

                            <button className="joinModalBtn" type="submit">
                                Join
                            </button>
                        </form>

                        <p className="joinModalNote">
                            Don't have an account?{' '}
                            <span
                                className="joinModalLink"
                                onClick={() => { setShowJoinModal(false); router('/auth'); }}
                            >
                                Sign up free
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
