import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
                const response = await axios.get(API_URL, {
                    withCredentials: true 
                });
                setNotifications(response.data);
            } catch (error) {
                console.error("Kunde inte hämta riktiga notiser från backend:", error);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await axios.patch(`${API_URL}/${id}/read`, {}, {
                withCredentials: true
            });

            setNotifications(prevNotifications =>
                prevNotifications.map(notis => {
                    if (notis._id === id) {
                        return { ...notis, read: true };
                    }
                    return notis;
                })
            );
        } catch (error) {
            console.error("Kunde inte markera notisen som läst i backend:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};