import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Send, Image as ImageIcon,
    MoreVertical, Phone, Video, Smile
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { useNotification } from '../contexts/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const ChatView: React.FC = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const supabase = useSupabase();
    const { showNotification } = useNotification();

    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatId) {
            fetchChatData();
            subscribeToMessages();
        }
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChatData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch chat details to get recipient
            const { data: chatData } = await supabase
                .from('chats')
                .select('*, user1:profiles!user_id_1(*), user2:profiles!user_id_2(*)')
                .eq('id', chatId)
                .single();

            if (chatData) {
                const otherUser = chatData.user_id_1 === user.id ? chatData.user2 : chatData.user1;
                setRecipient(otherUser);
            }

            // Fetch messages
            const { data: messageData } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            setMessages(messageData || []);
        } catch (err) {
            console.error('Error fetching chat:', err);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`chat:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const message = newMessage;
            setNewMessage('');

            const { error } = await supabase
                .from('messages')
                .insert({
                    chat_id: chatId,
                    sender_id: user.id,
                    content: message
                });

            if (error) throw error;
        } catch (err) {
            showNotification('Erro ao enviar mensagem', 'error');
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-white h-screen overflow-hidden font-sans">
            {/* Chat Header */}
            <header className="px-6 py-4 pt-12 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-100 overflow-hidden relative border-2 border-white shadow-sm">
                            <img
                                src={recipient?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                                className="w-full h-full object-cover"
                                alt="Avatar"
                            />
                            <div className="absolute bottom-0 right-0 size-2.5 bg-[#22eb7e] border-2 border-white rounded-full" />
                        </div>
                        <div>
                            <h2 className="font-black text-sm text-slate-900 leading-tight">{recipient?.full_name || recipient?.username || 'Carregando...'}</h2>
                            <p className="text-[10px] font-bold text-[#22eb7e] uppercase tracking-widest mt-0.5">Online Agora</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                        <Phone size={18} />
                    </button>
                    <button className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/50">
                {loading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="size-8 border-4 border-[#22eb7e] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_id !== recipient?.id;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                key={msg.id || idx}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[75%] p-4 rounded-[1.5rem] text-sm font-medium shadow-sm transition-all ${isMe
                                            ? 'bg-[#102217] text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                        }`}
                                >
                                    {msg.content}
                                    <p className={`text-[9px] mt-1.5 font-bold uppercase tracking-widest opacity-40 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </main>

            {/* Chat Input */}
            <footer className="p-6 bg-white border-t border-slate-100 flex flex-col gap-4">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-3 bg-slate-50 rounded-[2rem] p-2 pl-6 border border-slate-100 focus-within:border-[#22eb7e]/50 focus-within:ring-4 focus-within:ring-[#22eb7e]/5 transition-all"
                >
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escreva sua mensagem..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-900 placeholder:text-slate-300"
                    />
                    <div className="flex items-center gap-1">
                        <button type="button" className="size-10 rounded-full flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors">
                            <Smile size={20} />
                        </button>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="size-11 bg-[#22eb7e] text-[#102217] rounded-full flex items-center justify-center shadow-lg shadow-[#22eb7e]/30 active:scale-90 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            <Send size={18} fill="currentColor" />
                        </button>
                    </div>
                </form>
                <div className="flex items-center justify-around text-slate-300">
                    <button className="flex flex-col items-center gap-1 hover:text-slate-500 transition-colors">
                        <ImageIcon size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Foto</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 hover:text-slate-500 transition-colors">
                        <Phone size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Voz</span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default ChatView;
