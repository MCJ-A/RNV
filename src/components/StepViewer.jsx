import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetupStore } from '../store/useSetupStore';
import { useIIoTSimulator } from '../store/useIIoTSimulator';
import { useHistoryStore } from '../store/useHistoryStore';
import { useAuthStore } from '../store/useAuthStore';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, XCircle, Globe, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StepViewer() {
    const { selectedProduct, currentStepIndex, isFinished, nextStep, reset, clearSelection } = useSetupStore();
    const { tension, speed, setMachineState } = useIIoTSimulator();
    const { addLog } = useHistoryStore();
    const { operatorId } = useAuthStore();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // Redirect if no product is selected
    if (!selectedProduct) {
        navigate('/');
        return null;
    }

    const handleCancelConfirm = () => {
        addLog({
            status: 'CANCELLED',
            productId: selectedProduct.id,
            operatorId: operatorId || 'UNKNOWN'
        });
        setMachineState('PRODUCTION');
        clearSelection();
        navigate('/dashboard');
    };

    const handleFinishReset = () => {
        reset();
    };

    const handleFinishDashboard = () => {
        setMachineState('PRODUCTION');
        handleCancelConfirm();
    };

    const toggleLanguage = () => {
        const langs = ['pt', 'es', 'en'];
        const nextLang = langs[(langs.indexOf(i18n.language) + 1) % langs.length];
        i18n.changeLanguage(nextLang);
    };

    const handleNextStep = () => {
        if (currentStepIndex === selectedProduct.steps.length - 1) {
            addLog({
                status: 'COMPLETED',
                productId: selectedProduct.id,
                operatorId: operatorId || 'UNKNOWN'
            });
        }
        nextStep();
    };

    const prTitle = selectedProduct.product[i18n.language] || selectedProduct.product['pt'];

    if (isFinished) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8">
                <div className="bg-slate-800 p-12 rounded-2xl border border-slate-700 shadow-2xl text-center max-w-3xl w-full">
                    <CheckCircle2 className="w-32 h-32 text-emerald-500 mx-auto mb-8" />
                    <h1 className="text-4xl font-bold mb-6 text-emerald-400">{t('setup_completed_title')}</h1>
                    <p className="text-2xl text-slate-300 mb-12">{t('setup_completed_msg', { product: prTitle })}</p>
                    <div className="flex gap-6">
                        <button
                            onClick={handleFinishReset}
                            className="flex-1 h-24 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-3xl font-bold rounded-2xl transition-colors duration-200 flex items-center justify-center gap-4"
                        >
                            <RotateCcw className="w-10 h-10" />
                            {t('restart_btn')}
                        </button>
                        <button
                            onClick={handleFinishDashboard}
                            className="flex-1 h-24 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-3xl font-bold rounded-2xl transition-colors duration-200 flex items-center justify-center gap-4"
                        >
                            <CheckCircle2 className="w-10 h-10" />
                            {t('view_dashboard_btn')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const steps = selectedProduct.steps;
    const currentStep = steps[currentStepIndex];
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    const stTitle = currentStep.title[i18n.language] || currentStep.title['pt'];
    const stInstruction = currentStep.instruction[i18n.language] || currentStep.instruction['pt'];

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans select-none relative">
            {/* Cancel Modal Overlay */}
            {showCancelModal && (
                <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="bg-slate-800 rounded-3xl border border-red-500/50 p-12 max-w-3xl w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <div className="flex items-center gap-6 mb-8 text-red-500">
                            <AlertTriangle className="w-20 h-20" />
                            <h2 className="text-5xl font-bold">{t('abort_modal_title')}</h2>
                        </div>
                        <p className="text-3xl text-slate-300 mb-14 leading-relaxed">
                            {t('abort_modal_msg')}
                        </p>
                        <div className="flex gap-8">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 h-28 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-2xl text-3xl font-bold transition-colors"
                            >
                                {t('abort_modal_no')}
                            </button>
                            <button
                                onClick={handleCancelConfirm}
                                className="flex-[0.8] h-28 bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-2xl text-3xl font-bold flex items-center justify-center gap-4 transition-colors"
                            >
                                <XCircle className="w-10 h-10" />
                                {t('abort_modal_yes')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 p-4 md:p-6 flex flex-col sm:flex-row justify-between sm:items-center shrink-0 gap-4">
                <div className="text-center sm:text-left">
                    <h2 className="text-slate-400 text-lg md:text-2xl font-medium mb-1 md:mb-2 uppercase tracking-wide">
                        {t('step_x_of_y', { current: currentStepIndex + 1, total: steps.length })}
                    </h2>
                    <h1 className="text-2xl md:text-4xl font-bold leading-tight">{stTitle}</h1>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 md:gap-8">
                    <button
                        onClick={toggleLanguage}
                        className="bg-slate-700/50 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 px-4 md:px-6 py-2 md:py-4 rounded-xl flex items-center gap-2 md:gap-3 text-lg md:text-xl font-bold transition-colors"
                    >
                        <Globe className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                        <span className="hidden sm:inline">{t(`language_${i18n.language}`)}</span>
                        <span className="sm:hidden font-mono uppercase">{i18n.language}</span>
                    </button>

                    <div className="text-center sm:text-right">
                        <h3 className="text-slate-400 text-xs md:text-xl font-medium mb-1 uppercase tracking-wide">{t('product_label')}</h3>
                        <p className="text-xl md:text-3xl font-bold text-emerald-400">{prTitle}</p>
                    </div>
                    <button
                        onClick={() => setShowCancelModal(true)}
                        className="bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-500 border border-red-500/30 px-4 md:px-6 py-2 md:py-4 rounded-xl flex items-center gap-2 md:gap-3 text-lg md:text-xl font-bold transition-colors"
                    >
                        <XCircle className="w-6 h-6 md:w-8 md:h-8" />
                        <span className="hidden xs:inline">{t('cancel_btn')}</span>
                    </button>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-slate-800 shrink-0">
                <div
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-6 md:gap-8 overflow-y-auto lg:overflow-hidden h-full">
                {/* Left Side: Instructions */}
                <div className="flex-[1.2] flex flex-col bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-10 shadow-xl relative min-h-[300px]">
                    <div className="flex items-center gap-3 md:gap-5 mb-6 md:mb-8 bg-amber-500/10 p-4 md:p-6 rounded-xl md:rounded-2xl border border-amber-500/30">
                        <AlertTriangle className="w-8 h-8 md:w-12 md:h-12 text-amber-500 shrink-0" />
                        <span className="text-amber-500 text-xl md:text-2xl font-bold uppercase tracking-wider">{t('mandatory_instruction')}</span>
                    </div>

                    <p className="text-2xl md:text-4xl leading-snug text-slate-100 font-medium whitespace-pre-line">
                        {stInstruction}
                    </p>
                </div>

                {/* Right Side: Image/Reference & Telemetry */}
                <div className="flex-1 flex flex-col gap-6 min-h-[400px]">
                    {/* Live Telemetry HUD */}
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 md:p-6 shadow-lg flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900 border-l-4 border-l-cyan-500 shrink-0">
                        <div className="flex items-center gap-3 md:gap-4">
                            <Activity className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" />
                            <div>
                                <h3 className="text-slate-400 font-medium text-xs md:text-sm uppercase tracking-wider">{t('telemetry_label')}</h3>
                                <p className="text-slate-500 text-[10px] md:text-sm">{t('telemetry_source')}</p>
                            </div>
                        </div>

                        <div className="flex gap-6 md:gap-12">
                            <div className="text-right">
                                <p className="text-slate-400 mb-1 uppercase text-[10px] md:text-sm font-bold">{t('telemetry_bar')}</p>
                                <p className="text-2xl md:text-4xl font-black font-mono text-white">{tension.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-slate-400 mb-1 uppercase text-[10px] md:text-sm font-bold">{t('telemetry_speed')}</p>
                                <p className="text-2xl md:text-4xl font-black font-mono text-white">{speed}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-full relative rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-600 shadow-xl flex-1 min-h-[250px]">
                        <img
                            src={currentStep.image}
                            alt={stTitle}
                            className="object-contain w-full h-full p-2 opacity-90"
                            draggable="false"
                        />
                        {/* Overlay label */}
                        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-slate-900/90 backdrop-blur py-1 px-3 md:py-2 md:px-6 rounded-lg md:rounded-xl border border-slate-700 text-slate-300 text-sm md:text-xl font-medium">
                            {t('visual_reference')}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer / Main Action */}
            <footer className="p-4 md:p-8 shrink-0 bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10 border-t border-slate-800">
                <button
                    onClick={handleNextStep}
                    className="w-full h-20 md:h-28 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white text-2xl md:text-4xl font-extrabold rounded-xl md:rounded-2xl transition-all duration-200 flex items-center justify-center gap-4 md:gap-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform active:scale-[0.98]"
                >
                    {t('confirm_continue_btn')}
                    <ArrowRight className="w-8 h-8 md:w-12 md:h-12" />
                </button>
            </footer>
        </div>
    );
}
