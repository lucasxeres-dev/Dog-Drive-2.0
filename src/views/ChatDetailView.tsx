import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import { useSupabase } from '../hooks/useSupabase';
import {
    ArrowLeft, Send,
    Calendar, Bell, BellOff, Trash2,
    X, Shield, MoreHorizontal
} from 'lucide-react';

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
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden">
            <header className="px-6 pt-12 pb-6 bg-white shadow-sm shadow-slate-200/30 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all border border-slate-200/50"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-center bg-cover border-2 border-[#22eb7e]/30 shadow-lg shadow-[#22eb7e]/5" style={{ backgroundImage: `url(${chat.avatar})` }}></div>
                        <div>
                            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
                                {chat.name}
                                {isMuted && <BellOff size={12} className="text-slate-300" />}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <div className="w-1 h-1 rounded-full bg-[#22eb7e] animate-pulse" />
                                <span className="text-[9px] font-black text-[#2e9c60] uppercase tracking-widest leading-none">{chat.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200/50 hover:bg-slate-100 transition-colors"
                >
                    <MoreHorizontal size={20} />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 no-scrollbar bg-[#f8fafc]">
                <div className="flex flex-col items-center py-4">
                    <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
                        <Shield size={10} className="text-[#2e9c60]" />
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Conversa Encriptada</span>
                    </div>
                </div>

                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-20">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Send size={24} className="text-slate-300" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inicie a conversa!</p>
                    </div>
                ) : (
                    messages.map((m) => (
                        <div key={m.id || m.created_at} className={`flex flex-col max-w-[85%] animate-fade-in ${m.sender_id === user?.id ? 'self-end items-end' : 'self-start items-start'}`}>
                            <div className={`p-5 rounded-[2rem] shadow-lg shadow-slate-200/20 text-sm font-bold ${m.sender_id === user?.id ? 'bg-[#102217] text-[#22eb7e] rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'}`}>
                                {m.text}
                            </div>
                            <span className="text-[9px] font-black text-slate-300 mt-2.5 uppercase tracking-widest px-2">
                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </main>

            <div className="bg-white px-6 pt-4 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.04)] z-50">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => navigate(`/booking/${chat.id}`)}
                        className="h-10 px-6 bg-[#22eb7e]/10 text-[#2e9c60] rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all border border-[#22eb7e]/20"
                    >
                        <Calendar size={14} />
                        <span>Agendar Serviço</span>
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            className="input-premium pr-20 !h-16 shadow-none bg-slate-50 border-slate-100 focus:bg-white"
                            placeholder="Escreve uma mensagem..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            className="absolute right-2 top-2 size-12 bg-[#102217] text-[#22eb7e] rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSettings(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="relative w-full max-w-md bg-white rounded-[3rem] p-8 shadow-2xl"
                        >
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>

                            <div className="flex items-center justify-between mb-8 px-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Definições do Chat</h3>
                                <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => { setIsMuted(!isMuted); setShowSettings(false); }}
                                    className="w-full p-6 rounded-2xl bg-slate-50 flex items-center gap-5 group hover:bg-[#22eb7e]/10 transition-all border border-transparent hover:border-[#22eb7e]/20"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#22eb7e]">
                                        {isMuted ? <Bell size={20} /> : <BellOff size={20} />}
                                    </div>
                                    <span className="font-black uppercase text-[10px] tracking-widest text-slate-600">{isMuted ? 'Ativar' : 'Silenciar'} Notificações</span>
                                </button>

                                <button
                                    onClick={clearChat}
                                    className="w-full p-6 rounded-2xl bg-slate-50 flex items-center gap-5 group hover:bg-[#22eb7e]/10 transition-all border border-transparent hover:border-[#22eb7e]/20"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-amber-500">
                                        <Trash2 size={20} />
                                    </div>
                                    <span className="font-black uppercase text-[10px] tracking-widest text-slate-600">Limpar Conversa</span>
                                </button>

                                <button
                                    onClick={blockUser}
                                    className="w-full p-6 rounded-2xl bg-rose-50/50 flex items-center gap-5 group hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm text-rose-500">
                                        <X size={20} strokeWidth={3} />
                                    </div>
                                    <span className="font-black uppercase text-[10px] tracking-widest text-rose-500">Bloquear {chat.name}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatDetailView;
