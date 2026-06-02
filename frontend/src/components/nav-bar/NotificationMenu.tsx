import React, { useState } from 'react';
import styles from './NotificationMenu.module.css'; 
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationMenu = () => {
    const { notifications, markAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const count = notifications.filter(n => n.isRead === false).length;
    const latestNotifications = [...notifications].reverse().slice(0, 5);

    const handleToggleMenu = () => {


        if (isOpen === true) {
            notifications.forEach(notification => {
                if (!notification.isRead) {
                    markAsRead(notification.id);
                }
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className={styles.notificationMenu}>
            <button onClick={handleToggleMenu} className={styles.notificationBtn}>
                <img src="/icons/notification.png" alt="Notifications" className={styles.notificationIcon} />
                {count > 0 && <span className={styles.notificationBadge}>{count}</span>}
            </button>

            {isOpen && (
                <ul className={styles.notificationDropdown}>
                    {latestNotifications.map((notification) => (
                        <li key={notification.id} className={styles.notificationItem}>
                            <h4>{notification.title}</h4>
                            <p>{notification.message}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};