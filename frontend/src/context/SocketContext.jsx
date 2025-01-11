import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Create a context for the socket
const SocketContext = createContext();

// Custom hook to use the Socket context
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Establish the socket connection
        const newSocket = io(`${import.meta.env.VITE_BASE_URL || "http://localhost:4000"}`, {
            transports: ['websocket'],
        });

        setSocket(newSocket);

        // Cleanup the socket connection on component unmount
        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};