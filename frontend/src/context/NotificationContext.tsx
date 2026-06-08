import React, { createContext, useState, useEffect } from 'react';
import { apiCall } from '../utils/apiCall';

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
    unreadCount: number;
    markAsRead: (id: string) => Promise<void>; 
    refresh: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [updateTrigger, setUpdateTrigger] = useState(0);

    const refresh = () => setUpdateTrigger(prev => prev + 1);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await apiCall("/notifications");

                if (!response.ok) throw new Error("Failed to fetch notifications");

                const data = await response.json();
                setNotifications(data);
            } catch (error) {
                console.error("Could not fetch notifications from backend:", error);
            }
        };

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000); 

        return () => clearInterval(interval);
    }, [updateTrigger]);

    const markAsRead = async (id: string) => {
        try {
            const response = await apiCall(`/notifications/${id}/read`, "PATCH");

            if (!response.ok) throw new Error("Failed to update notification status");

            setNotifications(prevNotifications =>
                prevNotifications.map(notis => 
                    notis._id === id ? { ...notis, read: true } : notis
                )
            );
        } catch (error) {
            console.error("Could not mark notification as read in backend:", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, refresh }}>
            {children}
        </NotificationContext.Provider>
    );
};
