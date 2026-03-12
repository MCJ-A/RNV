import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistoryStore } from '../store/useHistoryStore';
import { X, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose }) {
    const { t } = useTranslation();
    const { historyLogs } = useHistoryStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-emerald-400" />
                        <h2 className="text-3xl font-bold text-white">{t('history_modal_title')}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {historyLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                            <Clock className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-xl">{t('history_empty')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-700">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-slate-400 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-semibold">{t('history_col_date')}</th>
                                        <th className="p-4 font-semibold">{t('history_col_op')}</th>
                                        <th className="p-4 font-semibold">{t('history_col_format')}</th>
                                        <th className="p-4 font-semibold">{t('history_col_status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {historyLogs.map((log) => {
                                        const date = new Date(log.timestamp).toLocaleString();
                                        const isCompleted = log.status === 'COMPLETED';

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-750 transition-colors">
                                                <td className="p-4 text-slate-300 whitespace-nowrap">{date}</td>
                                                <td className="p-4 text-emerald-400 font-mono">{log.operatorId}</td>
                                                <td className="p-4 text-slate-200 font-medium">{log.productId}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${isCompleted
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                        {isCompleted ? t('status_completed') : t('status_cancelled')}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors text-lg"
                    >
                        {t('close_btn')}
                    </button>
                </div>

            </div>
        </div>
    );
}
