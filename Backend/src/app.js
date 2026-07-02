import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import dns from "node:dns";

// Force IPv4 DNS resolution — fixes querySrv ENOTFOUND on Windows with Node.js v17+
dns.setDefaultResultOrder("ipv4first");

import userRoutes from "./routes/users.routes.js";

const app=express();
const server=createServer(app);
const io= connectToSocket(server);

app.set("port",(process.env.PORT || 8000));
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb"}));
app.use("/api/v1/users",userRoutes);
// app.use("/api/v2/users",newUserRoutes);

app.get("/",(req,res)=>{
    return res.json({"hello":"world"})
});

// MongoDB URI must be set as MONGO_URI environment variable on Render
// Local dev: set MONGO_URI in Backend/.env file
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("[FATAL] MONGO_URI environment variable is not set.");
    console.error("Set it in Backend/.env for local dev, or in Render environment variables for production.");
    process.exit(1);
}

const start = async()=>{
    try {
        const connectionDb= await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
        });
        app.set("mongo_user", connectionDb);
        console.log(`MONGO Connected DB: ${connectionDb.connection.host}`);

        // Handle port-already-in-use gracefully BEFORE calling listen
        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.error(`\n[ERROR] Port ${app.get("port")} is already in use.`);
                console.error("Kill the existing process and try again.");
            } else {
                console.error("[ERROR] Server error:", err.message);
            }
            process.exit(1);
        });

        server.listen(app.get("port"),()=>{
            console.log(`MeetFlow backend listening on port ${app.get("port")}`);
        });
    } catch(err) {
        console.error("[ERROR] Failed to connect to MongoDB:", err.message);
        console.error("Check your MongoDB Atlas network access list and internet connection.");
        process.exit(1);
    }
}
start();