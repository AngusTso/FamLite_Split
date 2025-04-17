import React, { createContext, useEffect, useState } from "react";
import io from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 初始化 Socket.IO
    const socketInstance = io("http://192.168.50.68:3000", {
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketInstance.on("connect", () => {
      console.log("Socket 連接成功:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.log("Socket 連接失敗:", err);
    });

    setSocket(socketInstance);

    // 清理
    return () => {
      socketInstance.disconnect();
      console.log("Socket 已斷開");
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
