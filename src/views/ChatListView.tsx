import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import { ChatPreview, Dog } from '../types';
import { Search, ArrowLeft, MoreHorizontal, Sparkles } from 'lucide-react';

const ChatListView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { user } = useAuth();
    const supabase = useSupabase();
    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [matches, setMatches] = useState<Dog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                // Fetch dogs for "New Matches" section
                const { data: matchData } = await supabase.from('dogs').select('*').limit(10);

                // Fetch chats where the user is a participant
                const { data: chatData, error: chatError } = await supabase
                    .from('chats')
                    .select('*')
                    .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

                if (chatError) throw chatError;

                if (chatData) {
                    const enhancedChats = await Promise.all(chatData.map(async (c: any) => {
                        const otherUserId = c.user_id_1 === user.id ? c.user_id_2 : c.user_id_1;
                        const { data: otherProfile } = await supabase.from('profiles').select('*').eq('id', otherUserId).single();

                        return {
                            id: c.id,
                            name: otherProfile?.full_name || 'Usuário',
                            avatar: otherProfile?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop',
                            lastMessage: c.last_message || 'Inicie a conversa!',
                            time: c.last_message_time ? new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Agora',
                            unreadCount: 0,
                            online: true
                        };
                    }));
                    setChats(enhancedChats);
                }

                if (matchData) {
                    setMatches(matchData.map((d: any) => ({
                        ...d,
                        imageUrl: d.image_url
                    })) as Dog[]);
                }
            } catch (err: any) {
                showNotification(err.message || 'Erro ao carregar mensagens', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Real-time subscription
        const channel = supabase.channel('chats-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-16">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm shadow-slate-200/30 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Mensagens</h1>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#22eb7e] animate-pulse" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Crescendo a Conexão</p>
                    </div>
                </div>
                <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200/50">
                    <MoreHorizontal size={20} />
                </button>
            </header>

            {/* Search Bar */}
            <div className="px-6 pb-6 bg-white">
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                        className="input-premium pl-14 shadow-sm"
                        placeholder="Pesquisar mensagens..."
                    />
                </div>
            </div>

            <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
                {/* New Matches Section */}
                <section className="mt-8 mb-4">
                    <div className="px-10 flex items-center gap-2 mb-4">
                        <Sparkles size={14} className="text-[#22eb7e]" />
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matches Recentes</h2>
                    </div>
                    <div className="flex overflow-x-auto no-scrollbar px-10 gap-6 pb-4">
                        {matches.length === 0 ? (
                            <div className="w-full py-8 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                                <p className="text-[10px] font-black uppercase tracking-widest">Sem novos matches</p>
                            </div>
                        ) : (
                            matches.map(dog => (
                                <div key={dog.id} className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer group" onClick={() => navigate(`/dog/${dog.id}`)}>
                                    <div className="relative w-20 h-20 rounded-[1.75rem] p-0.5 bg-gradient-to-br from-[#22eb7e] to-[#1ed170] shadow-lg shadow-[#22eb7e]/10 group-active:scale-95 transition-all">
                                        <div className="w-full h-full bg-center bg-cover rounded-[1.6rem] border-2 border-white" style={{ backgroundImage: `url(${dog.imageUrl})` }}></div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#22eb7e] rounded-full border-2 border-white flex items-center justify-center">
                                            <Sparkles size={10} className="text-[#102217]" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-600 truncate w-full text-center uppercase tracking-widest">{dog.name}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Conversations Section */}
                <section className="mt-4">
                    <div className="px-10 flex items-center gap-2 mb-4">
                        <MoreHorizontal size={14} className="text-slate-300" />
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversas</h2>
                    </div>
                    <div className="flex flex-col px-6 gap-3">
                        {chats.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center px-10">
                                <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-[200px]">Nenhuma conversa ativa ainda. Vamos dar o primeiro passo?</p>
                            </div>
                        ) : (
                            chats.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => navigate(`/chat/${chat.id}`)}
                                    className="flex items-center gap-5 p-5 bg-white rounded-[2rem] shadow-sm border border-slate-50 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-0.5 transition-all cursor-pointer group"
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-16 h-16 rounded-2xl bg-cover bg-center border border-slate-100 shadow-sm" style={{ backgroundImage: `url(${chat.avatar})` }}></div>
                                        {chat.online && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#22eb7e] rounded-full border-2 border-white shadow-sm"></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="text-base font-black text-slate-900 truncate leading-none">{chat.name}</h3>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${chat.unreadCount > 0 ? 'text-[#2e9c60]' : 'text-slate-300'}`}>{chat.time}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className={`text-xs truncate pr-4 leading-relaxed ${chat.unreadCount > 0 ? 'font-black text-[#102217]' : 'font-bold text-slate-400'}`}>{chat.lastMessage}</p>
                                            {chat.unreadCount > 0 && <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#22eb7e] flex items-center justify-center text-[10px] font-black text-[#102217] shadow-sm">{chat.unreadCount}</div>}
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
