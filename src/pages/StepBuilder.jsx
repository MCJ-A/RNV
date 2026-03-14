import React, { useState, useEffect } from 'react';
import { Plus, Save, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function StepBuilder() {
    const [fabricos, setFabricos] = useState([]);
    const [selectedSecao, setSelectedSecao] = useState('');
    const [ordem, setOrdem] = useState(1);
    const [descricao, setDescricao] = useState('');
    const [ferramentasStr, setFerramentasStr] = useState('');
    const [episStr, setEpisStr] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFabricos();
    }, []);

    const fetchFabricos = async () => {
        try {
            // Call the mock backend init just in case it's empty
            await fetch('http://localhost:3001/api/init');
            const res = await fetch('http://localhost:3001/api/fabrico');
            const data = await res.json();
            setFabricos(data);
            
            // Auto-select first section to help UX
            if (data.length > 0 && data[0].secoes.length > 0) {
                setSelectedSecao(data[0].secoes[0].id);
            }
        } catch (error) {
            console.error("Erro ao comunicar com backend:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const ferramentasArray = ferramentasStr.split(',').map(s => s.trim()).filter(Boolean);
        const episArray = episStr.split(',').map(s => s.trim()).filter(Boolean);

        try {
            const res = await fetch(`http://localhost:3001/api/secao/${selectedSecao}/passos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-role': 'ENGINEER' // RBAC Mock Auth
                },
                body: JSON.stringify({
                    ordem,
                    descricao,
                    ferramentas: ferramentasArray,
                    episRequeridos: episArray
                })
            });

            if (res.ok) {
                alert('Passo de fabrico adicionado com sucesso!');
                setDescricao('');
                setOrdem(Number(ordem) + 1);
                fetchFabricos(); // refresh to show updated list
            } else {
                const errorData = await res.json();
                alert(`Erro: ${errorData.error}`);
            }
        } catch (error) {
            alert('Falha na comunicação com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-300">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-emerald-400 flex items-center gap-3">
                            <ShieldCheck className="w-10 h-10" />
                            Engineer Console
                        </h1>
                        <p className="text-slate-400 mt-2">Construtor Oficial de Receitas e Changeovers</p>
                    </div>
                    <div className="bg-slate-800 border border-emerald-500/30 px-6 py-3 rounded-full flex items-center gap-3">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="font-bold text-emerald-400">ADMINISTRADOR</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* FORMULARIO DE CRIAÇÃO */}
                    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Adicionar Novo Passo</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Selecionar Seção de Fabrico</label>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 outline-none"
                                    value={selectedSecao}
                                    onChange={(e) => setSelectedSecao(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Selecione uma seção...</option>
                                    {fabricos.map(fab => (
                                        <optgroup key={fab.id} label={fab.nome}>
                                            {fab.secoes.map(sec => (
                                                <option key={sec.id} value={sec.id}>{sec.nome}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-1/3">
                                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Ordem</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        required
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 outline-none"
                                        value={ordem}
                                        onChange={(e) => setOrdem(e.target.value)}
                                    />
                                </div>
                                <div className="w-2/3">
                                    <label className="block text-sm font-bold text-amber-500 mb-2 uppercase flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Interlock de Segurança (EPIs)
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Ex: Luvas, Óculos (Separado por vírgula)"
                                        className="w-full bg-slate-800 border border-amber-500/50 rounded-xl p-4 text-white focus:border-amber-500 outline-none"
                                        value={episStr}
                                        onChange={(e) => setEpisStr(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Ferramentas Necessárias</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Chave Allen 5mm, Torquímetro"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 outline-none"
                                    value={ferramentasStr}
                                    onChange={(e) => setFerramentasStr(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase">Instrução Técnica</label>
                                <textarea 
                                    required
                                    rows="4"
                                    placeholder="Descreva a ação técnica precisa..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:border-emerald-500 outline-none resize-none"
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg p-5 rounded-xl flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Gravando...' : <><Save className="w-6 h-6" /> Guardar Passo de Setup</>}
                            </button>
                        </div>
                    </form>

                    {/* PREVIEW EM TEMPO REAL */}
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl overflow-y-auto max-h-[80vh]">
                        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4 flex items-center gap-3">
                            Resumo da Secção 
                        </h2>
                        
                        {fabricos.map(fab => (
                            <div key={fab.id} className="mb-8">
                                <h3 className="text-xl font-bold text-cyan-400 mb-4">{fab.nome}</h3>
                                {fab.secoes.map(sec => (
                                    <div key={sec.id} className="ml-4 mb-6">
                                        <h4 className="text-lg font-bold text-slate-300 mb-2 bg-slate-800 p-2 rounded">{sec.nome} (Previsto: {sec.tempoPrevisto}m)</h4>
                                        <div className="space-y-3">
                                            {sec.passos.map(p => (
                                                <div key={p.id} className="bg-slate-800/50 border-l-4 border-emerald-500 p-4 rounded pr-4 flex flex-col gap-2">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-bold text-emerald-400 min-w-8">#{p.ordem}</span>
                                                        <p className="flex-1 text-slate-300 text-sm ml-2">{p.descricao}</p>
                                                    </div>
                                                    
                                                    {p.episRequeridos.length > 0 && (
                                                        <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded w-fit ml-10 border border-amber-500/30">
                                                            🔒 Requer EPI: {p.episRequeridos.join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                            {sec.passos.length === 0 && <p className="text-slate-500 italic ml-4">Sem passos definidos.</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
