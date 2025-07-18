import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

export const useSocket = () => {
  const authToken = localStorage.getItem("authToken");
  const socketRef = useRef(null);

  useEffect(() => {
    if (!authToken) return;

    const socket = io(import.meta.env.VITE_SERVER_URL.replace("/api", ""), {
      auth: { token: authToken },
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: true
    });

    socket.on("success", ({ msg, status }) => {
      if (status === "success") toast.success(msg);
    });

    socket.on("error", ({ type, msg }) => {
      toast.error(`${type} : ${msg}`);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [authToken]);

  return socketRef.current;
};
