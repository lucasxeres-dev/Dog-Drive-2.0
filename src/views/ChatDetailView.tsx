import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { useSupabase } from '../hooks/useSupabase';

const ChatDetailView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const supabase = useSupabase();
    const { user } = useAuth();
    const { id } = useParams();
    const [messages, setMessages] = useState<any[]>([]);
    const [chat, setChat] = useState<any>(null);
    const [input, setInput] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !id) return;

        const fetchChatDetails = async () => {
            setLoading(true);
            try {
                // Fetch chat metadata
                const { data: chatData, error: chatError } = await supabase
                    .from('chats')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (chatError) throw chatError;

                const otherUserId = chatData.user_id_1 === user.id ? chatData.user_id_2 : chatData.user_id_1;
                const { data: otherProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', otherUserId)
                    .single();

                setChat({
                    ...chatData,
                    name: otherProfile?.full_name || 'User',
                    avatar: otherProfile?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop',
                    role: otherProfile?.role || 'User'
                });

                // Fetch messages
                const { data: msgData, error: msgError } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('chat_id', id)
                    .order('created_at', { ascending: true });

                if (msgError) throw msgError;
                setMessages(msgData || []);
            } catch (err: any) {
                showNotification(err.message || 'Erro ao carregar chat', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchChatDetails();

        // Subscribe to new messages
        const channel = supabase.channel(`chat-${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `chat_id=eq.${id}`
            }, (payload: any) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [id, user]);

    const sendMessage = async () => {
        if (!input.trim() || !user || !id) return;

        const newMessage = {
            chat_id: id,
            sender_id: user.id,
            text: input,
            created_at: new Date().toISOString()
        };

        setInput('');

        try {
            const { error } = await supabase.from('messages').insert([newMessage]);
            if (error) throw error;
        } catch (err: any) {
            showNotification('Erro ao enviar mensagem', 'error');
            console.error(err);
        }
    };

    const clearChat = () => {
        // In a real app, this might just clear local state or call an API
        setMessages([]);
        setShowSettings(false);
        showNotification('Conversa limpa localmente', 'success');
    };

    const blockUser = () => {
        showNotification('Usuário bloqueado', 'success');
        navigate('/chats');
    };

    if (loading) return <div className="flex-1 flex items-center justify-center">Carregando...</div>;
    if (!chat) return <div className="flex-1 flex items-center justify-center">Chat não encontrado</div>;

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark h-screen overflow-hidden">
            <header className="bg-white dark:bg-surface-dark px-4 py-3 flex items-center border-b border-gray-100 dark:border-white/5 shrink-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent mr-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="size-10 rounded-full bg-center bg-cover mr-3 border-2 border-primary/20" style={{ backgroundImage: `url(${chat.avatar})` }}></div>
                <div className="flex flex-col flex-1">
                    <h1 className="text-base font-black uppercase tracking-tight leading-tight">{chat.name} {isMuted && <span className="material-symbols-outlined text-xs text-gray-400 align-middle">notifications_off</span>}</h1>
                    <span className="text-[10px] font-black text-primary uppercase italic">{chat.role}</span>
                </div>
                <button onClick={() => setShowSettings(true)} className="size-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-outlined font-bold">more_vert</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar bg-gray-50/30 dark:bg-transparent">
                <div className="flex flex-col items-center py-6 opacity-40">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Conversation Secured</span>
                    <div className="h-px w-20 bg-primary/30"></div>
                </div>
                {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center opacity-20 italic text-sm">No messages yet</div>
                ) : (
                    messages.map((m) => (
                        <div key={m.id || m.created_at} className={`flex flex-col max-w-[85%] animate-fadeIn ${m.sender_id === user?.id ? 'self-end items-end' : 'self-start items-start'}`}>
                            <div className={`p-4 rounded-[1.5rem] shadow-xl shadow-black/5 text-sm font-bold ${m.sender_id === user?.id ? 'bg-[#111814] text-primary rounded-br-none' : 'bg-white dark:bg-surface-dark text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-white/5'}`}>
                                {m.text}
                            </div>
                            <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-tight">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    ))
                )}
            </main>

            <div className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-white/5 p-4 pb-10 shadow-2xl z-10">
                <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => navigate(`/booking/${chat.id}`)} className="flex items-center gap-1.5 bg-primary/10 text-primary px-5 py-2.5 rounded-full shrink-0 font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all border border-primary/20">
                        <span className="material-symbols-outlined text-lg">calendar_month</span>
                        <span>{t('book')}</span>
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        className="flex-1 bg-gray-100 dark:bg-white/5 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 border-none transition-all placeholder:opacity-30"
                        placeholder="Write a loud message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button onClick={sendMessage} className="size-14 bg-primary rounded-[1.2rem] shadow-xl shadow-primary/20 text-[#111814] flex items-center justify-center active:scale-90 transition-all">
                        <span className="material-symbols-outlined text-2xl font-black">send</span>
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-[3rem] p-8 shadow-2xl animate-slideUp">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black uppercase italic tracking-tight">Chat Settings</h3>
                            <button onClick={() => setShowSettings(false)} className="size-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => { setIsMuted(!isMuted); setShowSettings(false); }}
                                className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center gap-4 group hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                            >
                                <span className={`material-symbols-outlined ${isMuted ? 'text-primary' : 'text-gray-400'}`}>
                                    {isMuted ? 'notifications_active' : 'notifications_off'}
                                </span>
                                <span className="font-black uppercase text-xs tracking-widest">{isMuted ? 'Unmute' : 'Mute'} Notifications</span>
                            </button>

                            <button
                                onClick={clearChat}
                                className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center gap-4 group hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                            >
                                <span className="material-symbols-outlined text-gray-400">delete_sweep</span>
                                <span className="font-black uppercase text-xs tracking-widest">Clear Conversation</span>
                            </button>

                            <button
                                onClick={blockUser}
                                className="w-full p-5 rounded-2xl bg-red-500/5 flex items-center gap-4 group hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                            >
                                <span className="material-symbols-outlined text-red-500">block</span>
                                <span className="font-black uppercase text-xs tracking-widest text-red-500">Block {chat.name}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatDetailView;
