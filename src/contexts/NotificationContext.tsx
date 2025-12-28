import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

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
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] w-[calc(100%-48px)] max-w-md animate-in slide-in-from-top-10 duration-500">
                    <div className={`px-6 py-4 rounded-[2rem] shadow-2xl border backdrop-blur-xl flex items-center justify-between gap-4 ${notification.type === 'success'
                            ? 'bg-[#22eb7e] text-[#102217] border-[#22eb7e]/20'
                            : notification.type === 'error'
                                ? 'bg-red-500 text-white border-red-400/20'
                                : 'bg-slate-900 text-white border-white/10'
                        }`}>
                        <div className="flex items-center gap-4">
                            <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 ${notification.type === 'success' ? 'bg-black/10' : 'bg-white/10'
                                }`}>
                                {notification.type === 'success' && <CheckCircle size={24} strokeWidth={2.5} />}
                                {notification.type === 'error' && <AlertCircle size={24} strokeWidth={2.5} />}
                                {notification.type === 'info' && <Info size={24} strokeWidth={2.5} />}
                            </div>
                            <p className="font-black text-sm uppercase tracking-wider leading-tight">
                                {notification.message}
                            </p>
                        </div>
                        <button onClick={hideNotification} className="opacity-40 hover:opacity-100 transition-opacity">
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>
                    <div className="mx-auto w-24 h-1.5 bg-black/10 dark:bg-white/10 rounded-full mt-4 blur-xl opacity-20"></div>
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
