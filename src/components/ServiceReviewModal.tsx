import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
    providerName: string;
    providerAvatar: string;
}

const ServiceReviewModal: React.FC<ServiceReviewModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    providerName,
    providerAvatar
}) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        onSubmit(rating, comment);
        setIsSubmitting(false);
        setRating(0);
        setComment('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-[20%] md:inset-x-auto md:w-full md:max-w-md md:left-1/2 md:-translate-x-1/2 bg-white rounded-[2.5rem] p-8 z-50 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>

                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-[2rem] p-1 bg-white shadow-xl shadow-slate-200 mb-6">
                                <img
                                    src={providerAvatar}
                                    alt={providerName}
                                    className="w-full h-full rounded-[1.75rem] object-cover"
                                />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 text-center leading-tight mb-2">
                                Como foi o serviço com {providerName}?
                            </h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8 text-center">
                                Sua avaliação ajuda a comunidade
                            </p>

                            <div className="flex gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            size={32}
                                            className={`transition-colors ${star <= (hoverRating || rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : 'fill-slate-100 text-slate-200'
                                                }`}
                                            strokeWidth={star <= (hoverRating || rating) ? 0 : 2}
                                        />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                placeholder="Conte mais sobre sua experiência..."
                                className="w-full h-32 bg-slate-50 rounded-2xl p-4 mb-6 font-bold text-slate-600 text-sm border-2 border-transparent focus:border-[#22eb7e]/20 outline-none resize-none transition-all placeholder:text-slate-300"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />

                            <button
                                onClick={handleSubmit}
                                disabled={rating === 0 || isSubmitting}
                                className="btn-primary-premium w-full !h-14 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-[#102217] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Avaliar Serviço'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ServiceReviewModal;
