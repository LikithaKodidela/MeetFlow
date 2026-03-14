import express from "express";
import {createServer} from "node:http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";

import userRoutes from "./routes/users.routes.js";

const app=express();
const server=createServer(app);
const io= connectToSocket(server);

app.set("port",(process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb"}));
app.use("/api/v1/users",userRoutes);
// app.use("/api/v2/users",newUserRoutes);

app.get("/",(req,res)=>{
    return res.json({"hello":"world"})
});

const start = async()=>{
    app.set("mongo_user")
    const connectionDb= await mongoose.connect("mongodb+srv://likithakodidela14_db_user:ZZEmBR2bbvvaN2Yg@cluster0.1rajgcp.mongodb.net/")

    console.log(`MONGO Connected DB:${connectionDb.connection.host}`);
    server.listen(app.get("port"),()=>{
        console.log("Listening on port 8000");
    });
}
start();