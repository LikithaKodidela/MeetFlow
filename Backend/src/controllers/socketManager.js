import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};
let socketToRoom = {};

const removeSocketFromRoom = (socketId, io) => {
    const roomKey = socketToRoom[socketId];
    if (!roomKey || !connections[roomKey]) {
        delete socketToRoom[socketId];
        delete timeOnline[socketId];
        return;
    }

    connections[roomKey].forEach((participantId) => {
        if (participantId !== socketId) {
            io.to(participantId).emit("user-left", socketId);
        }
    });

    connections[roomKey] = connections[roomKey].filter(
        (participantId) => participantId !== socketId,
    );

    if (connections[roomKey].length === 0) {
        delete connections[roomKey];
        delete messages[roomKey];
    }

    delete socketToRoom[socketId];
    delete timeOnline[socketId];
};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED");

        socket.on("join-call", (path) => {
            removeSocketFromRoom(socket.id, io);

            if (connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);
            socketToRoom[socket.id] = path;
            timeOnline[socket.id] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit(
                    "user-joined",
                    socket.id,
                    connections[path],
                );
            }

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit(
                        "chat-message",
                        messages[path][a]["data"],
                        messages[path][a]["sender"],
                        messages[path][a]["socket-id-sender"],
                    );
                }
            }
        });

        socket.on("leave-call", () => {
            removeSocketFromRoom(socket.id, io);
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const matchingRoom = socketToRoom[socket.id];

            if (matchingRoom && connections[matchingRoom]) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }

                messages[matchingRoom].push({
                    sender: sender,
                    data: data,
                    "socket-id-sender": socket.id,
                });

                console.log("message", matchingRoom, ":", sender, data);

                connections[matchingRoom].forEach((participantId) => {
                    io.to(participantId).emit(
                        "chat-message",
                        data,
                        sender,
                        socket.id,
                    );
                });
            }
        });

        socket.on("disconnect", () => {
            removeSocketFromRoom(socket.id, io);
        });
    });

    return io;
};
