import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from '../contexts/LanguageContext';
import { Plus, Edit2, Trash2, Calendar, ShieldCheck, AlertCircle, Save, X } from 'lucide-react';

interface Vaccine {
    id: string;
    dog_id: string;
    name: string;
    date: string;
    booster_date: string | null;
    observations: string | null;
}

interface VaccinationWalletProps {
    dogId: string;
}

const VaccinationWallet: React.FC<VaccinationWalletProps> = ({ dogId }) => {
    const supabase = useSupabase();
    const { showNotification } = useNotification();
    const { t } = useTranslation();
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        date: new Date().toISOString().split('T')[0],
        booster_date: '',
        observations: ''
    });

    useEffect(() => {
        fetchVaccines();
    }, [dogId]);

    const fetchVaccines = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vaccines')
                .select('*')
                .eq('dog_id', dogId)
                .order('date', { ascending: false });

            if (error) throw error;
            setVaccines(data || []);
        } catch (error: any) {
            showNotification('Erro ao carregar vacinas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.date) {
            showNotification('Nome e data são obrigatórios', 'error');
            return;
        }

        // Proactive Fix 2: Frontend Date Validation
        if (formData.booster_date && new Date(formData.booster_date) <= new Date(formData.date)) {
            showNotification('A data de reforço deve ser posterior à data da dose', 'error');
            return;
        }

        try {
            const vaccineData = {
                dog_id: dogId,
                name: formData.name,
                date: formData.date,
                booster_date: formData.booster_date || null,
                observations: formData.observations || null
            };

            if (editingVaccine) {
                const { error } = await supabase
                    .from('vaccines')
                    .update(vaccineData)
                    .eq('id', editingVaccine.id);
                if (error) throw error;
                showNotification('Vacina atualizada!', 'success');
            } else {
                const { error } = await supabase
                    .from('vaccines')
                    .insert(vaccineData);
                if (error) throw error;
                showNotification('Vacina registrada!', 'success');
            }

            setFormData({ name: '', date: new Date().toISOString().split('T')[0], booster_date: '', observations: '' });
            setIsAdding(false);
            setEditingVaccine(null);
            fetchVaccines();
        } catch (error: any) {
            showNotification(error.message || 'Erro ao salvar vacina', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este registro?')) return;
        try {
            const { error } = await supabase
                .from('vaccines')
                .delete()
                .eq('id', id);
            if (error) throw error;
            showNotification('Registro removido', 'success');
            fetchVaccines();
        } catch (error: any) {
            showNotification('Erro ao excluir', 'error');
        }
    };

    const startEdit = (v: Vaccine) => {
        setEditingVaccine(v);
        setFormData({
            name: v.name,
            date: v.date,
            booster_date: v.booster_date || '',
            observations: v.observations || ''
        });
        setIsAdding(true);
    };

    if (loading && vaccines.length === 0) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 animate-pulse rounded-3xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShieldCheck className="text-primary" size={24} />
                    Carteira de Vacinação
                </h2>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="size-10 rounded-full bg-primary text-[#102217] flex items-center justify-center shadow-lg active:scale-95 transition-all"
                    >
                        <Plus size={24} />
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-surface-dark p-6 rounded-[2rem] border-2 border-primary/20 shadow-xl animate-scaleIn">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold uppercase tracking-widest text-xs text-primary">
                            {editingVaccine ? 'Editar Vacina' : 'Nova Vacina'}
                        </h3>
                        <button onClick={() => { setIsAdding(false); setEditingVaccine(null); }} className="text-gray-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-1 block">Nome da Vacina</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="ex: V10, Antirrábica..."
                                className="w-full h-14 bg-gray-50 dark:bg-white/5 rounded-2xl px-5 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-1 block">Data da Dose</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full h-14 bg-gray-50 dark:bg-white/5 rounded-2xl px-5 font-bold border-2 border-transparent focus:border-primary/30 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-1 block">Reforço (Opcional)</label>
                                <input
                                    type="date"
                                    value={formData.booster_date}
                                    onChange={e => setFormData({ ...formData, booster_date: e.target.value })}
                                    className="w-full h-14 bg-gray-50 dark:bg-white/5 rounded-2xl px-5 font-bold border-2 border-transparent focus:border-primary/30 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-1 block">Observações</label>
                            <textarea
                                value={formData.observations}
                                onChange={e => setFormData({ ...formData, observations: e.target.value })}
                                placeholder="Fabricante, lote, reações..."
                                className="w-full h-24 bg-gray-50 dark:bg-white/5 rounded-2xl p-5 font-bold border-2 border-transparent focus:border-primary/30 transition-all shadow-inner resize-none text-sm"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full h-14 bg-primary text-[#102217] font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest mt-2"
                        >
                            <Save size={20} />
                            <span>{editingVaccine ? 'Atualizar' : 'Salvar'}</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {vaccines.length === 0 && !isAdding ? (
                    <div className="p-10 text-center flex flex-col items-center gap-4 bg-white/50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                        <div className="size-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-500">Nenhuma vacina registrada</p>
                            <p className="text-xs text-gray-400 mt-1">Mantenha a saúde do seu cão em dia</p>
                        </div>
                    </div>
                ) : (
                    vaccines.map(v => (
                        <div key={v.id} className="group relative bg-white dark:bg-surface-dark p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-lg leading-tight uppercase tracking-tight">{v.name}</h4>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(v)} className="size-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-primary transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(v.id)} className="size-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                                            <Calendar size={14} className="text-gray-400" />
                                            {new Date(v.date).toLocaleDateString('pt-PT')}
                                        </div>
                                        {v.booster_date && (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500">
                                                <AlertCircle size={14} />
                                                Próxima: {new Date(v.booster_date).toLocaleDateString('pt-PT')}
                                            </div>
                                        )}
                                    </div>

                                    {v.observations && (
                                        <p className="mt-3 text-xs font-medium text-gray-400 italic bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-transparent group-hover:border-primary/10">
                                            "{v.observations}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VaccinationWallet;
