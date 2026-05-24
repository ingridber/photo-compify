import React, { createContext, useState, useEffect, useContext } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    markAsRead: (id: string) => void;
}


export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [mockCompetition, setMockCompetition] = useState({
    title: "Bästa naturbilden",
    phase: "submission"
});

    const markAsRead = (id: string) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notis => {
                if (notis.id === id) {
                    return {...notis, isRead: true};
                }
                return notis;
            })
        );
    };

    useEffect(() => {
    const timer = setInterval(() => {
        if (mockCompetition.phase === "submission") {
            setMockCompetition({
                ...mockCompetition,
                phase: "voting"
            });
            
            const newNotification: Notification = {
                id: Date.now().toString(),
                title: mockCompetition.title,
                message: "Tävlingen har nu gått i röstningsfasen!",
                isRead: false
            };

            setNotifications(prev => [...prev, newNotification]);

        } else if (mockCompetition.phase === "voting") {
            setMockCompetition({
                ...mockCompetition,
                phase: "ended"
            });

            const newNotification: Notification = {
                id: Date.now().toString(),
                title: mockCompetition.title,
                message: "Tävlingen är nu avslutad.",
                isRead: false
            };

            setNotifications(prev => [...prev, newNotification]);
        }
    }, 30000);

    return () => clearInterval(timer);
}, [mockCompetition]);


return (
    <NotificationContext.Provider value={{ notifications, markAsRead}}>
        {children}
    </NotificationContext.Provider>
    )
};