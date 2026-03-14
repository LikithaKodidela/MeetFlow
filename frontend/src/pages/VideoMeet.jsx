import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from "../environment.js";

const server_url = server;
var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const RemoteVideoTile = React.memo(function RemoteVideoTile({
  socketId,
  stream,
}) {
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (remoteVideoRef.current && stream && remoteVideoRef.current.srcObject !== stream) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={styles.conferenceTile}>
      <video
        data-socket={socketId}
        ref={remoteVideoRef}
        autoPlay
        playsInline
      ></video>
    </div>
  );
});

export default function VideoMeet() {
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setModal] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);
  const videoRef = useRef([]);

  let cleanupCallState = (resetState = true) => {
    if (socketRef.current) {
      socketRef.current.emit("leave-call");
    }

    Object.keys(connections).forEach((id) => {
      try {
        connections[id].close();
      } catch (e) {
        console.log(e);
      }
      delete connections[id];
    });

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    videoRef.current = [];
    if (resetState) {
      setVideos([]);
      setMessages([]);
      setMessage("");
      setNewMessages(0);
      setModal(false);
    }
  };

  let ensureBlackSilenceStream = () => {
    if (window.localStream) return window.localStream;

    let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
    window.localStream = blackSilence();
    return window.localStream;
  };

  let attachLocalStreamToConnection = (connection) => {
    if (!connection) return;

    const stream = ensureBlackSilenceStream();
    const currentTracks = stream.getTracks();
    const senders = connection.getSenders();

    currentTracks.forEach((track) => {
      const existingSender = senders.find(
        (sender) => sender.track && sender.track.kind === track.kind,
      );

      if (existingSender) {
        if (existingSender.track !== track) {
          existingSender.replaceTrack(track).catch((e) => console.log(e));
        }
        return;
      }

      connection.addTrack(track, stream);
    });

    senders.forEach((sender) => {
      if (!sender.track) return;

      const stillExists = currentTracks.some(
        (track) => track.kind === sender.track.kind,
      );

      if (!stillExists) {
        sender.replaceTrack(null).catch((e) => console.log(e));
      }
    });

    connection.__localStream = stream;
  };

  let sendOfferToPeer = (socketId) => {
    const connection = connections[socketId];
    if (!connection) return;
    if (connection.signalingState !== "stable") return;

    connection
      .createOffer()
      .then((description) => {
        connection
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              socketId,
              JSON.stringify({ sdp: connection.localDescription }),
            );
          })
          .catch((e) => console.log(e));
      })
      .catch((e) => console.log(e));
  };

  let createPeerConnection = (socketListId) => {
    if (!socketListId || socketListId === socketIdRef.current) return null;
    if (connections[socketListId]) return connections[socketListId];

    const connection = new RTCPeerConnection(peerConfigConnections);

    connection.onicecandidate = (event) => {
      if (event.candidate != null) {
        socketRef.current.emit(
          "signal",
          socketListId,
          JSON.stringify({ ice: event.candidate }),
        );
      }
    };

    connection.ontrack = (event) => {
      let remoteStream = event.streams && event.streams[0];

      if (!remoteStream) {
        remoteStream = connection.__remoteStream || new MediaStream();
        const trackAlreadyExists = remoteStream
          .getTracks()
          .some((track) => track.id === event.track.id);

        if (!trackAlreadyExists) {
          remoteStream.addTrack(event.track);
        }
      }

      connection.__remoteStream = remoteStream;

      setVideos((videos) => {
        const videoExists = videos.some(
          (video) => video.socketId === socketListId,
        );

        const updatedVideos = videoExists
          ? videos.map((video) =>
              video.socketId === socketListId
                ? { ...video, stream: remoteStream }
                : video,
            )
          : [
              ...videos,
              {
                socketId: socketListId,
                stream: remoteStream,
                autoPlay: true,
                playsinline: true,
              },
            ];

        videoRef.current = updatedVideos;
        return updatedVideos;
      });
    };

    connections[socketListId] = connection;
    return connection;
  };

  //TODO
  // if(isChrome() ===  false)
  // {

  // }
  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (localVideoRef.current && window.localStream) {
      localVideoRef.current.srcObject = window.localStream;
    }
  }, [askForUsername]);

  useEffect(() => {
    return () => {
      cleanupCallState(false);
    };
  }, []);

  let getuserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      attachLocalStreamToConnection(connections[id]);
      sendOfferToPeer(id);
    }
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          //TODO BlackSilence
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            attachLocalStreamToConnection(connections[id]);
            sendOfferToPeer(id);
          }
        }),
    );
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = ctx.createMediaStreamDestination();
    oscillator.connect(dst);

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then((stream) => getuserMediaSuccess(stream))
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  //TODO
  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (!connections[fromId]) {
        createPeerConnection(fromId);
      }

      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
      }
    }
  };

  //TODO addMessage
  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);

    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevCount) => prevCount + 1);
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        if (connections[id]) {
          connections[id].close();
          delete connections[id];
        }

        setVideos((videos) => {
          const updatedVideos = videos.filter((video) => video.socketId !== id);
          videoRef.current = updatedVideos;
          return updatedVideos;
        });
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          const connection = createPeerConnection(socketListId);
          attachLocalStreamToConnection(connection);
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            attachLocalStreamToConnection(connections[id2]);
            sendOfferToPeer(id2);
          }
        }
      });
    });
  };
  
 let routeTo=useNavigate();

  let connect = () => {
    setMessages([]);
    setMessage("");
    setNewMessages(0);
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    setAskForUsername(false);
    connectToSocketServer();
  };

  let handleVideo = () => {
    setVideo(!video);
  };

  let handleAudio = () => {
    setAudio(!audio);
  };

  let sendMessage = () =>{
    socketRef.current.emit("chat-message",message,username);
    setMessage(" ");
  };

  let handleEndCall = () =>{
      try
      {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop())
      }
      catch(e)
      {

      }
      cleanupCallState()
      routeTo("/home")
  }


  let getDisplayMediaSucess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      attachLocalStreamToConnection(connections[id]);
      sendOfferToPeer(id);
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        }),
    );
  };

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSucess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  let handleScreen = () => {
    setScreen(!screen);
  };

  let getConferenceLayoutClass = () => {
    if (videos.length <= 1) return styles.layoutSingle;
    if (videos.length <= 4) return styles.layoutMedium;
    if (videos.length <= 6) return styles.layoutLarge;
    return styles.layoutXLarge;
  };

  let handleChatToggle = () => {
    setModal((prev) => {
      const nextState = !prev;
      if (nextState) {
        setNewMessages(0);
      }
      return nextState;
    });
  };

  return (
    <div>
      {askForUsername === true ? (
        <div className={styles.lobbyWrapper}>
          <div className={styles.lobbyPanel}>
            <div className={styles.lobbyCopy}>
              <p className={styles.lobbyEyebrow}>MeetFlow </p>
              <h2>Join when you are ready</h2>
              <p>Check your camera preview, enter your name, then connect.</p>
            </div>

            <div className={styles.lobbyControls}>
              <TextField
                id="outlined-basic"
                label="Username"
                value={username}
                variant="outlined"
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={connect}>
                Connect
              </Button>
            </div>
          </div>

          <div className={styles.lobbyPreviewCard}>
            <video
              className={styles.lobbyPreviewVideo}
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
            ></video>
            <div className={styles.lobbyPreviewBadge}>Camera Preview</div>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                  <h1 className={styles.chatTitle}>Chat</h1>
                </div>
               
                <div className={styles.chattingDisplay}>
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      return (
                        <div className={styles.chatMessage} key={index}>
                          <p className={styles.chatSender}>{item.sender}</p>
                          <p className={styles.chatBubble}>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className={styles.chatEmpty}>No messages yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    className={styles.chatInput}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                  <Button
                    className={styles.chatSendButton}
                    variant="contained"
                    onClick={sendMessage}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon  />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="secondary">
              <IconButton
                onClick={handleChatToggle}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
          ></video>

          <div
            className={`${styles.conferenceView} ${
              showModal ? styles.conferenceViewWithChat : ""
            } ${getConferenceLayoutClass()}`}
          >
            {videos.map((video) => (
              <RemoteVideoTile
                key={video.socketId}
                socketId={video.socketId}
                stream={video.stream}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
