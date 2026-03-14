import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <>

            <div className="navBar">

                <div className="navBrand">
                    <h2>MeetFlow</h2>
                    <p>Meet. Talk. Collaborate.</p>
                </div>

                <div className="navBarActions">
                    <div
                        className="navBarHistory"
                        onClick={() => {
                            navigate("/history")
                        }}
                    >
                        <IconButton onClick={
                            ()=>{
                                navigate("/history")
                            }
                        }>
                            <RestoreIcon />
                        </IconButton>
                        <p>History</p>
                    </div>

                    <Button
                        className="navBarLogout"
                        onClick={() => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }}
                    >
                        Logout
                    </Button>
                </div>


            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2 style={{paddingBottom:".5rem"}}>Start Your Meeting</h2>

                        <div style={{ display: 'flex', gap: "10px" }}>

                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" variant="outlined" />
                            <Button onClick={handleJoinVideoCall} variant='contained'>Join</Button>

                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
    
        </>
    )
}


export default withAuth(HomeComponent)
