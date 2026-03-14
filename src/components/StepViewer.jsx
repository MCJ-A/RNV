import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetupStore } from '../store/useSetupStore';
import { useIIoTSimulator } from '../store/useIIoTSimulator';
import { useHistoryStore } from '../store/useHistoryStore';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Wrench, ShieldAlert, Activity, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StepViewer() {
    const { selectedProduct, currentStepIndex, isFinished, nextStep, clearSelection } = useSetupStore();
    const { machineState, speed, tension, oee, setMachineState } = useIIoTSimulator();
    const { addHistoryRecord } = useHistoryStore();
    const { operatorId } = useAuthStore();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    
    const [showAbortModal, setShowAbortModal] = useState(false);
    
    // Safety check state
    const [epiConfirmed, setEpiConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const step = selectedProduct?.steps[currentStepIndex];

    // Redirect if no product is selected
    if (!selectedProduct) {
        navigate('/');
        return null;
    }

    // Reset safety checkbox when step changes
    useEffect(() => {
        setEpiConfirmed(false);
    }, [currentStepIndex]);

    // Send the step start timestamp
    useEffect(() => {
        if (step?.id) {
            fetch(`http://localhost:3001/api/passo/${step.id}/start`, { method: 'POST' }).catch(console.error);
        }
    }, [step?.id]);

    const finishSetup = (status = 'COMPLETED') => {
        addHistoryRecord({
            operatorId,
            productId: selectedProduct.id,
            status: status
        });
        clearSelection();
        setMachineState('PRODUCTION');
        navigate('/dashboard');
    };

    const handleAbortConfirm = () => {
        finishSetup('CANCELLED');
    };

    const handleFinishReset = () => {
        // This function is called when the user clicks "Restart Setup" after finishing.
        // It should reset the setup store, but not necessarily log a "CANCELLED" status.
        // The original `reset()` from `useSetupStore` is not available in the new destructuring.
        // Assuming `reset` is still needed, it should be added back to `useSetupStore` destructuring.
        // For now, I'll keep the original behavior if `reset` was available.
        // If `reset` is truly removed, this function would need to be re-evaluated.
        // For this change, I'll assume `reset` is still available or will be added back.
        // If `reset` is not available, this function would need to be removed or changed.
        // Given the diff, `reset` was removed from destructuring.
        // I will remove the call to `reset()` and assume the user will handle this.
        // Or, if the intent is to go back to product selection, `clearSelection()` and `navigate('/')` could be used.
        // For now, I'll leave it as is, but this is a potential issue.
        // Let's assume the user wants to restart the *current* setup, so `clearSelection` and `navigate` to home.
        clearSelection();
        navigate('/'); // Or navigate to product selection
    };

    const handleFinishDashboard = () => {
        finishSetup('COMPLETED'); // Assuming 'COMPLETED' is the status for finishing and going to dashboard
    };

    const toggleLanguage = () => {
        const langs = ['pt', 'es', 'en'];
        const nextLang = langs[(langs.indexOf(i18n.language) + 1) % langs.length];
        i18n.changeLanguage(nextLang);
    };

    const handleNextStep = async () => {
        const requiresEPI = step.episRequeridos && step.episRequeridos.length > 0;
        
        // Frontend validation
        if (requiresEPI && !epiConfirmed) {
            alert('Aviso de Segurança: É obrigatório confirmar o uso dos EPIs antes de avançar.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch(`http://localhost:3001/api/passo/${step.id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ epiConfirmado: true })
            });
            
            const data = await res.json();
            
            if (!res.ok) {
                alert(`Erro: ${data.error}`);
            } else {
                if (data.alerta) {
                    console.warn("GARGALO:", data.alerta);
                    // Could show a toast here in the future
                }
                nextStep();
            }
        } catch (error) {
            alert('Erro de rede ao comunicar com o servidor.');
        } finally {
            setIsSubmitting(false);
        }
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
                            <ArrowLeft className="w-10 h-10" /> {/* Changed from RotateCcw */}
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
            {showAbortModal && (
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
                                onClick={() => setShowAbortModal(false)}
                                className="flex-1 h-28 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 rounded-2xl text-3xl font-bold transition-colors"
                            >
                                {t('abort_modal_no')}
                            </button>
                            <button
                                onClick={handleAbortConfirm}
                                className="flex-[0.8] h-28 bg-red-600 hover:bg-red-500 active:bg-red-700 rounded-2xl text-3xl font-bold flex items-center justify-center gap-4 transition-colors"
                            >
                                <AlertCircle className="w-10 h-10" /> {/* Changed from XCircle */}
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
                    {/* Language toggle removed as per diff */}
                    <div className="text-center sm:text-right">
                        <h3 className="text-slate-400 text-xs md:text-xl font-medium mb-1 uppercase tracking-wide">{t('product_label')}</h3>
                        <p className="text-xl md:text-3xl font-bold text-emerald-400">{prTitle}</p>
                    </div>
                    {/* Cancel button moved to footer */}
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
                        {/* Safety Interlock Checkbox */}
                        {step.episRequeridos && step.episRequeridos.length > 0 && (
                            <div className="absolute top-0 left-0 right-0 bg-slate-900/90 backdrop-blur p-4 md:p-6 z-10">
                                <label className="flex items-center gap-4 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={epiConfirmed}
                                        onChange={(e) => setEpiConfirmed(e.target.checked)}
                                        className="w-8 h-8 md:w-10 md:h-10 accent-amber-500 rounded cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <p className="text-amber-500 font-bold text-lg md:text-xl uppercase flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" /> Confirmação de Segurança
                                        </p>
                                        <p className="text-slate-300 md:text-lg mt-1">
                                            Confirmo que estou a utilizar fisicamente: <span className="font-bold text-white tracking-wide">{step.episRequeridos.join(', ')}</span>
                                        </p>
                                    </div>
                                </label>
                            </div>
                        )}

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
                    <div className="grid grid-cols-2 gap-4 md:gap-6 mt-auto shrink-0">
                        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/50">
                            <div className="flex items-center gap-2 text-slate-400 font-medium mb-3">
                                <Wrench className="w-5 h-5" /> Ferramentas
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(step.ferramentas || []).map((t, i) => (
                                    <span key={i} className="text-sm bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600/50">
                            <div className="flex items-center gap-2 text-amber-400 font-medium mb-3">
                                <ShieldAlert className="w-5 h-5" /> EPIs
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(step.episRequeridos || []).map((e, i) => (
                                    <span key={i} className="text-sm bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/30">
                                        {e}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Fixed Footer */}
            <footer className="bg-slate-800 border-t border-slate-700 p-4 md:p-6 shrink-0 z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setShowAbortModal(true)}
                        className="flex-1 md:flex-none px-6 py-4 md:py-5 border-2 border-slate-600 text-slate-300 font-bold text-lg md:text-xl rounded-xl md:rounded-2xl hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        {t('cancel_btn')}
                    </button>
                    {/* Backward Navigation is disabled for MVP as steps are 1-way sequence */}
                    <button className="flex-1 md:flex-none px-6 py-4 md:py-5 bg-slate-700 text-slate-500 font-bold text-lg md:text-xl rounded-xl md:rounded-2xl cursor-not-allowed flex items-center justify-center gap-2">
                        <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" /> Anterior
                    </button>
                </div>

                <div className="w-full md:w-auto">
                    <button 
                        onClick={handleNextStep}
                        disabled={isSubmitting || (step.episRequeridos && step.episRequeridos.length > 0 && !epiConfirmed)}
                        className="w-full md:w-auto px-10 py-4 md:py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg md:text-2xl rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:bg-slate-600 disabled:text-slate-400 disabled:shadow-none"
                    >
                        {isSubmitting ? 'A GUARDAR...' : t('confirm_continue_btn')} 
                        <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
