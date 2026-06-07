import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationMenu.module.css'; 
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationMenu = () => {
    const { notifications, markAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    
    const menuRef = useRef<HTMLDivElement>(null);

    const count = notifications.filter(n => !n.read).length;
    const latestNotifications = notifications.slice(0, 5);

    useEffect(() => {
        if (isOpen) {
            latestNotifications.forEach(n => {
                if (!n.read) {
                    markAsRead(n._id);
                }
            });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleToggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleNotificationClick = (notification: any) => {
        setIsOpen(false);
        navigate(`/competitions/${notification.competition}`);
    };

    return (
        <div className={styles.notificationMenu} ref={menuRef}>
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