import React, { useState, useEffect } from 'react';

export const NotificationTimer = () => {
    const [notifications, setNotifications] = useState<any[]>([]);

    const [mockCompetition, setMockcompetition] = useState({
        title: "Bästa naturbilden",
        phase: "submission"
    });

    useEffect(() => {
        const timer = setInterval(() => {

            if(mockCompetition.phase === "submission") {
                setMockcompetition({
                    ...mockCompetition,
                    phase: "voting"
                });
            
            const newNotifications = {
                id: Date.now().toString(),
                title: mockCompetition.title,
                message: "Tävlingen har nu gått i röstningsfasen!",
                isRead: false
            };

            setNotifications([
                ...notifications,
                newNotifications
            ]);
            } else if(mockCompetition.phase === "voting") {
                setMockcompetition({
                    ...mockCompetition,
                    phase: "ended"
                });

                const newNotifications = {
                    id: Date.now().toString(),
                    title: mockCompetition.title,
                    message: "Tävlingen är nu avslutad.",
                    isRead: false
                };

                setNotifications([
                    ...notifications,
                    newNotifications
                ]);
            }

        }, 30000)
        return () => clearInterval(timer);
    }, [mockCompetition]);

    return null;
};