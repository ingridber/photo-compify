import React, { createContext, useState, useEffect } from 'react';

interface Notification {
    _id: string;        
    competition: string; 
    title: string;
    description: string; 
    read: boolean;       
    phase: string;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    markAsRead: (id: string) => Promise<void>; 
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_URL = "http://localhost:3000/api/v1/notifications";

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await fetch(API_URL, {
                    method: "GET",
                    credentials: "include" 
                });

                if (!response.ok) throw new Error("Failed to fetch notifications");

                const data = await response.json();
                setNotifications(data);
            } catch (error) {
                console.error("Could not fetch notifications from backend:", error);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/${id}/read`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            if (!response.ok) throw new Error("Failed to update notification status");

            setNotifications(prevNotifications =>
                prevNotifications.map(notis => {
                    if (notis._id === id) {
                        return { ...notis, read: true };
                    }
                    return notis;
                })
            );
        } catch (error) {
            console.error("Could not mark notification as read in backend:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};