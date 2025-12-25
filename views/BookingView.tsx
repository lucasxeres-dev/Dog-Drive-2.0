
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../LanguageContext';

const BookingView: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState<number>(5);

    return (
        <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark font-display overflow-y-auto no-scrollbar">
            <header className="sticky top-0 z-20 flex items-center bg-background-light/95 dark:bg-background-dark/95 p-4 border-b border-gray-100 dark:border-white/5">
                <button onClick={() => navigate(-1)} className="text-[#111814] dark:text-white size-10 flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10 rounded-full">
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
                <div className="flex flex-col items-center flex-1">
                    <h2 className="text-lg font-bold">{t('book')}</h2>
                </div>
                <div className="size-10"></div>
            </header>

            <div className="p-4 flex flex-col gap-6">
                <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm">
                    <div className="relative shrink-0">
                        <img className="size-16 rounded-full object-cover border-2 border-primary" src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150" alt="Walker" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold text-lg">Pedro Santos</h3>
                        <p className="text-sm text-gray-500">Rio de Janeiro, RJ</p>
                        <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wide">Walker & Sitter</p>
                    </div>
                </div>

                <section>
                    <div className="flex justify-between items-end mb-3">
                        <h3 className="text-xl font-bold">{t('date')}</h3>
                        <span className="text-xs font-bold text-primary uppercase">{t('september_2025')}</span>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-3xl p-4 shadow-sm border border-gray-50 dark:border-white/5">
                        <div className="grid grid-cols-7 gap-y-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <p key={d} className="text-gray-400 text-xs font-bold text-center">{d}</p>)}
                            {Array.from({ length: 30 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(i + 1)}
                                    className={`h-10 w-full flex items-center justify-center text-sm font-medium rounded-full transition-all ${selectedDate === i + 1 ? 'bg-primary text-[#102217] font-bold shadow-lg shadow-primary/20 scale-110' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="bg-white dark:bg-surface-dark p-5 rounded-3xl border border-gray-100 dark:border-white/10 mb-24 transition-all">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-4">{t('summary')}</h4>
                    <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full text-primary"><span className="material-symbols-outlined">pets</span></div>
                            <div>
                                <p className="font-bold text-sm">{t('walking_service')}</p>
                                <p className="text-xs text-gray-500">{selectedDate < 10 ? `0${selectedDate}` : selectedDate} Set, 10:00</p>
                            </div>
                        </div>
                        <p className="font-bold">R$ 45,00</p>
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-white/5 my-4"></div>
                    <div className="flex justify-between items-end">
                        <p className="text-lg font-bold text-gray-400">{t('total')}</p>
                        <p className="text-3xl font-extrabold tracking-tight">R$ 50,00</p>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background-light dark:from-background-dark pt-8">
                <button onClick={() => navigate('/chats')} className="w-full bg-primary text-[#102217] font-bold text-lg h-14 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all">
                    {t('pay_btn')}
                </button>
            </div>
        </div>
    );
};

export default BookingView;
