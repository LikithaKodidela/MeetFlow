import React, { createContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { StatusCodes } from "http-status-codes";
import server from "../environment.js";

export const AuthContext = createContext(null);

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})


export const AuthProvider = ({children})=>{
    const [userData,setUserData] = useState(null);
    const router =useNavigate();

    const handleRegister = async (name,username,password)=>{
        try {
            let request = await client.post("/register",{
                name,
                username,
                password
            });

            if(request.status === StatusCodes.CREATED){
                return request.data.message;
            }
        }
        catch(err){
            throw err;
        }
    }
       

    const handleLogin = async (username,password) =>{
        try
        {
             let request = await client.post("/login",{
                username,
                password
             });

             if(request.status === StatusCodes.OK)
             {
                localStorage.setItem("token",request.data.token);
                setUserData({ username, token: request.data.token });
                router("/");
                return request.data;
             }
        }
        catch(err)
        {
            throw err;
        }
    }
    
    const getHistoryOfUser =async () =>{
        try
        {
            let request = await client.get("/get_all_activity",{
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        }
        catch(err)
        {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) =>{
        try{
            let request = await client.post("/add_to_activity",{
                token:localStorage.getItem("token"),
                meeting_code:meetingCode
            });
            return request
        }
        catch(e)
        {
            throw e;
        }
    }
    
    const data ={
        userData,setUserData,addToUserHistory,getHistoryOfUser,handleRegister,handleLogin
    };
    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
}
