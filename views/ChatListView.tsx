
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { useTranslation } from '../LanguageContext';
import { ChatPreview, Dog } from '../types';
import { MOCK_CHATS, MOCK_DOGS } from '../constants';

const ChatListView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [matches, setMatches] = useState<Dog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            if (!isSupabaseConfigured) {
                setChats(MOCK_CHATS);
                setMatches(MOCK_DOGS.slice(0, 5));
                setLoading(false);
                return;
            }

            try {
                const { data: chatData } = await supabase.from('chats').select('*');
                const { data: matchData } = await supabase.from('dogs').select('*').limit(5);

                if (chatData && chatData.length > 0) {
                    setChats(chatData as ChatPreview[]);
                } else {
                    setChats(MOCK_CHATS);
                }

                if (matchData && matchData.length > 0) {
                    setMatches(matchData as Dog[]);
                } else {
                    setMatches(MOCK_DOGS.slice(0, 5));
                }
            } catch (err) {
                console.error('Supabase fetch failed, falling back to mock data', err);
                setChats(MOCK_CHATS);
                setMatches(MOCK_DOGS.slice(0, 5));
            }
            setLoading(false);
        };

        fetchData();

        // Subscription for real-time messages
        let channel: any;
        if (isSupabaseConfigured) {
            channel = supabase.channel('chats-channel')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                    fetchData();
                })
                .subscribe();
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display h-screen overflow-hidden">
            <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-4 pt-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{t('messages')}</h1>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm">
                        <span className="material-symbols-outlined">tune</span>
                    </button>
                </div>
            </header>

            <div className="px-4 pb-4">
                <div className="flex w-full items-center rounded-full h-12 bg-white dark:bg-surface-dark shadow-sm px-4">
                    <span className="material-symbols-outlined text-[#608a72]">search</span>
                    <input className="flex-1 bg-transparent border-none focus:ring-0 text-base" placeholder={t('search_placeholder')} />
                </div>
            </div>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
                <section className="flex flex-col">
                    <h2 className="text-xs font-bold uppercase tracking-wider px-4 pb-3 pt-2 opacity-60">{t('new_matches')}</h2>
                    <div className="flex w-full overflow-x-auto no-scrollbar px-4 pb-4 gap-4">
                        {matches.length === 0 ? (
                            <p className="px-4 text-sm text-gray-500">No new matches.</p>
                        ) : (
                            matches.map(dog => (
                                <div key={dog.id} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer" onClick={() => navigate(`/dog/${dog.id}`)}>
                                    <div className="relative w-[72px] h-[72px] rounded-full border-2 border-primary p-0.5">
                                        <div className="w-full h-full bg-center bg-cover rounded-full" style={{ backgroundImage: `url(${dog.imageUrl})` }}></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
                                    </div>
                                    <p className="text-xs font-semibold truncate w-full text-center">{dog.name}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="flex flex-col mt-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider px-4 pb-2 opacity-60">{t('conversations')}</h2>
                    <div className="flex flex-col">
                        {chats.length === 0 ? (
                            <p className="px-4 py-8 text-center text-sm text-gray-400">No active conversations yet.</p>
                        ) : (
                            chats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => navigate(`/chat/${chat.id}`)}
                                    className="flex items-center gap-4 px-4 py-3 hover:bg-white dark:hover:bg-surface-dark transition-colors cursor-pointer"
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-14 h-14 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${chat.avatar})` }}></div>
                                        {chat.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center h-full gap-0.5">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold truncate">{chat.name}</h3>
                                            <span className={`text-xs ${chat.unreadCount > 0 ? 'text-primary font-bold' : 'text-gray-400'}`}>{chat.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-sm truncate pr-2 ${chat.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                                            {chat.unreadCount > 0 && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-black">{chat.unreadCount}</div>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>


        </div>
    );
};

export default ChatListView;
