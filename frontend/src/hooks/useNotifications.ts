import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    
    if (context === undefined) {
        throw new Error('useNotifications needs to be used inside NotificationProvider');
    }
    
    return context;
};