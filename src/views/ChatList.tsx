import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Search, MessageSquare,
    MoreHorizontal, Filter, Star, Sparkles
} from 'lucide-react';
import { useSupabase } from '../hooks/useSupabase';
import { EmptyState, PremiumSkeleton } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, Match } from '../types';

const ChatList: React.FC = () => {
    const navigate = useNavigate();
    const supabase = useSupabase();

    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChatMatches();
    }, []);

    const fetchChatMatches = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: matches, error } = await supabase
                .from('matches')
                .select(`
                    id,
                    match_type,
                    target_profile_id,
                    target_profile:profiles!target_profile_id(*)
                `)
                .eq('user_id', user.id)
                .is('target_dog_id', null);

            if (error) throw error;

            const formattedChats = (matches as any[] || []).map((match) => {
                const prof = Array.isArray(match.target_profile) ? match.target_profile[0] : match.target_profile;
                if (!prof) return null;

                return {
                    id: match.id,
                    lastMessage: 'Aguardando início da conversa...',
                    time: 'Agora',
                    unread: 0,
                    user: {
                        ...prof,
                        rating: prof.rating || (4.5 + Math.random() * 0.5),
                        service_type: match.match_type || 'Profissional'
                    }
                };
            }).filter(Boolean);

            setChats(formattedChats);
        } catch (err) {
            console.error('Error fetching matches:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#f8fafc] h-screen overflow-hidden pb-24 font-sans">
            <header className="px-6 pt-12 pb-6 bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Matches</h1>
                        <p className="text-[10px] font-black text-[#22eb7e] uppercase tracking-[0.2em] mt-1">Sua Alcateia Premium</p>
                    </div>
                    <button className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm">
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#22eb7e] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar profissionais..."
                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-[#22eb7e]/5 transition-all outline-none"
                    />
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-4 rounded-[2rem] flex items-center gap-4">
                                    <PremiumSkeleton className="size-16 !rounded-full shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <PremiumSkeleton className="h-4 w-1/3" />
                                        <PremiumSkeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : chats.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-20"
                        >
                            <EmptyState
                                icon={<Sparkles size={48} className="text-[#22eb7e]" />}
                                title="Nenhum match ainda"
                                description="Continue explorando o feed para encontrar os melhores profissionais para o seu pet!"
                                action={{
                                    label: 'Ir para o Feed',
                                    onClick: () => navigate('/feed')
                                }}
                            />
                        </motion.div>
                    ) : (
                        chats.map((chat, idx) => (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={chat.id}
                                onClick={() => navigate(`/chat/${chat.id}`)}
                                className="w-full bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-4 hover:border-[#22eb7e] hover:shadow-xl hover:shadow-[#22eb7e]/5 transition-all group"
                            >
                                <div className="size-16 rounded-full overflow-hidden relative border-4 border-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                                    <img
                                        src={chat.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.user.id}`}
                                        className="w-full h-full object-cover"
                                        alt="Avatar"
                                    />
                                    <div className="absolute bottom-1 right-1 size-3 bg-[#22eb7e] border-2 border-white rounded-full" />
                                </div>

                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-black text-slate-900 tracking-tighter truncate leading-none">
                                            {chat.user.full_name || chat.user.username}
                                        </h4>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <Star size={10} className="text-amber-400 fill-amber-400" />
                                            <span className="text-[10px] font-black">{chat.user.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-[#22eb7e] uppercase tracking-widest bg-[#22eb7e]/10 px-2 py-0.5 rounded-md">
                                            {chat.user.service_type === 'walker' ? 'Passeador' : chat.user.service_type === 'hotel' ? 'Hospedagem' : 'Groomer'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-medium truncate">
                                        {chat.lastMessage}
                                    </p>
                                </div>

                                <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#22eb7e]/10 group-hover:text-[#22eb7e] transition-colors">
                                    <ChevronLeft className="rotate-180" size={18} />
                                </div>
                            </motion.button>
                        ))
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ChatList;
