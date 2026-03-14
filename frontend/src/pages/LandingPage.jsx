import React from 'react';
import { Link,useNavigate } from "react-router-dom";
export default function Landing() {
     const router = useNavigate();
  return (
    <div className='landingPageContainer'>
        <nav>
            <div className='navHeader'>
                <h2>MeetFlow </h2>
            </div>
            <div className='navlist'>
                 <p onClick={()=>{
                    router("/ddjs8y")
                 }}>Join Meeting</p>

                 <p onClick={()=>{
                    router("/auth")
                 }}>Sign Up</p>

                 <div onClick={()=>{
                    router("/auth")
                 }} role='button'>
                     <p>Login</p>
                 </div>
            </div>
        </nav>

        <div className="landingMainContainer">
             <div>
                 <h1><span style={{color:"#FF9839"}}>Connect</span> Face-to-Face, Anytime</h1>

                 <p>Instant video meetings that feel real.</p>
                 <div role="button">
                    <Link to={"/auth"}>Start Meeting</Link>
                 </div>
             </div>
             <div>
                    <img src="/mobile.png" alt=""/>
             </div>
        </div>
    </div>
  )
}
