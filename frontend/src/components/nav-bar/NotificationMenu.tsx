import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import styles from './NotificationMenu.module.css'; 
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationMenu = () => {
    const { notifications, markAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const count = notifications.filter(n => n.read === false).length;
    const latestNotifications = notifications.slice(0, 5);

    const handleToggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            markAsRead(notification._id);
        }
        setIsOpen(false);
        navigate(`/competitions/${notification.competition}`);
    };

    return (
        <div className={styles.notificationMenu}>
            <button onClick={handleToggleMenu} className={styles.notificationBtn}>
                <img src="/icons/notification.png" alt="Notifications" className={styles.notificationIcon} />
                {count > 0 && <span className={styles.notificationBadge}>{count}</span>}
            </button>

            {isOpen && (
                <ul className={styles.notificationDropdown}>
                    {latestNotifications.length === 0 ? (
                        <li className={styles.noNotifications}>No new notifications</li>
                    ) : (
                        latestNotifications.map((notification) => (
                            <li 
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                            >
                                <h4>{notification.title}</h4>
                                <p>{notification.description}</p> 
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};
