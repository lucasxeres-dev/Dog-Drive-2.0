import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Search, MessageSquare,
    MoreHorizontal, Filter
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { EmptyState } from '../components/UIComponents';
import { motion } from 'framer-motion';

const ChatList: React.FC = () => {
    const navigate = useNavigate();
    const supabase = useSupabase();

    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('chats')
                .select('*, user1:profiles!user_id_1(*), user2:profiles!user_id_2(*)')
                .or(`user_id_1.eq.${user.id}, user_id_2.eq.${user.id} `)
                .order('last_message_at', { ascending: false });

            const formattedChats = (data || []).map(chat => {
                const otherUser = chat.user_id_1 === user.id ? chat.user2 : chat.user1;
                return {
                    id: chat.id,
                    lastMessage: 'Sem mensagens ainda',
                    time: chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    unread: 0,
                    user: otherUser
                };
            });

            setChats(formattedChats);
        } catch (err) {
            console.error('Error fetching chats:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-24 font-sans">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-black text-slate-900">Mensagens</h1>
                    <button className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-300 group-focus-within:text-[#22eb7e] transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Procurar conversas..."
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-[#22eb7e]/5 transition-all"
                    />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <div className="size-8 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : chats.length === 0 ? (
                    <EmptyState
                        icon={<MessageSquare size={32} />}
                        title="Nenhuma conversa"
                        description="Inicie um serviço ou faça um match para começar a conversar."
                    />
                ) : (
                    chats.map((chat) => (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={chat.id}
                            onClick={() => navigate(`/ chat / ${chat.id} `)}
                            className="w-full bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 active:scale-[0.98] transition-all hover:border-[#22eb7e]/30"
                        >
                            <div className="size-14 rounded-full bg-slate-100 overflow-hidden relative border-2 border-white shadow-sm flex-shrink-0">
                                <img
                                    src={chat.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.user.id}`}
                                    className="w-full h-full object-cover"
                                    alt="Avatar"
                                />
                                <div className="absolute bottom-0.5 right-0.5 size-3 bg-[#22eb7e] border-2 border-white rounded-full" />
                            </div >
                            <div className="flex-1 text-left">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h4 className="font-black text-sm text-slate-900">{chat.user.full_name || chat.user.username}</h4>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase">{chat.time}</span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
                                    {chat.lastMessage}
                                </p>
                            </div>
                            {
                                chat.unread > 0 && (
                                    <div className="size-5 bg-[#22eb7e] rounded-full flex items-center justify-center text-[10px] font-black text-[#102217]">
                                        {chat.unread}
                                    </div>
                                )
                            }
                        </motion.button >
                    ))
                )}
            </main >
        </div >
    );
};

export default ChatList;
