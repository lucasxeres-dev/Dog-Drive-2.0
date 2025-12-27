import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    notification: Notification | null;
    showNotification: (message: string, type: NotificationType) => void;
    hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notification, setNotification] = useState<Notification | null>(null);

    const showNotification = (message: string, type: NotificationType) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const hideNotification = () => setNotification(null);

    return (
        <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
            {children}
            {notification && (
                <div className={`fixed top-4 right-4 z-[9999] px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-8 duration-300 font-bold border ${notification.type === 'success' ? 'bg-[#27f17b] text-[#050705] border-[#27f17b]/20' :
                        notification.type === 'error' ? 'bg-red-500 text-white border-red-400/20' :
                            'bg-blue-500 text-white border-blue-400/20'
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">
                            {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
                        </span>
                        {notification.message}
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within a NotificationProvider');
    return context;
};
