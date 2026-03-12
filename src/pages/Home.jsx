import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetupStore } from '../store/useSetupStore';
import { useIIoTSimulator } from '../store/useIIoTSimulator';
import { PlayCircle, Factory, History, Globe, Activity, Gauge, Thermometer, Zap, Maximize, Minimize, LogOut, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HistoryModal from '../components/HistoryModal';
import { useAuthStore } from '../store/useAuthStore';

export default function Home() {
    const { availableProducts, selectProduct } = useSetupStore();
    const { machineState, speed, tension, oee, temperature, startSimulation, setMachineState } = useIIoTSimulator();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const { operatorId, logout } = useAuthStore();

    // Start simulation on load and ensure it's in PRODUCTION state before setup starts
    useEffect(() => {
        setMachineState('PRODUCTION');
        startSimulation();
    }, [startSimulation, setMachineState]);

    const handleStartSetup = (productId) => {
        selectProduct(productId);
        // Industry 4.0 interlock: Changing machine to SETUP state kills the speed
        setMachineState('SETUP');
        navigate('/setup');
    };

    const toggleLanguage = () => {
        const langs = ['pt', 'es', 'en'];
        const nextLang = langs[(langs.indexOf(i18n.language) + 1) % langs.length];
        i18n.changeLanguage(nextLang);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const handleLogout = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col font-sans select-none">
            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />

            {/* Header */}
            <header className="mb-12 flex justify-between items-center border-b border-slate-800 pb-6 shrink-0">
                <div>
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{t('app_title')}</h1>
                    <p className="text-2xl text-slate-400 mt-2">{t('app_subtitle')}</p>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-3 bg-slate-800/80 px-6 py-4 rounded-2xl border border-slate-700 mr-4">
                        <UserCircle className="w-8 h-8 text-cyan-400" />
                        <div>
                            <p className="text-slate-400 text-sm font-bold uppercase">Operador</p>
                            <p className="text-white text-xl font-mono leading-none">{operatorId}</p>
                        </div>
                    </div>

                    <button
                        onClick={toggleFullscreen}
                        className="flex justify-center items-center w-16 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-2xl text-2xl font-bold transition-colors border border-slate-700 hover:border-slate-500"
                        title={t('kiosk_mode_btn')}
                    >
                        {isFullscreen ? <Minimize className="w-8 h-8 text-amber-500" /> : <Maximize className="w-8 h-8 text-slate-300" />}
                    </button>
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 px-6 py-4 rounded-2xl text-2xl font-bold transition-colors border border-slate-700 hover:border-emerald-500/50"
                    >
                        <Globe className="w-8 h-8 text-emerald-500" />
                        {t(`language_${i18n.language}`)}
                    </button>
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 px-8 py-6 rounded-2xl text-2xl font-bold transition-colors border border-slate-700 hover:border-slate-500"
                    >
                        <History className="w-8 h-8 text-slate-300" />
                        {t('history_btn')}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex justify-center items-center w-20 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 rounded-2xl transition-colors border border-red-500/30"
                        title="Logout"
                    >
                        <LogOut className="w-8 h-8 text-red-500" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col xl:flex-row gap-12 overflow-hidden">

                {/* Left Side: IIoT Telemetry Dashboard */}
                <div className="xl:w-1/3 flex flex-col gap-6">
                    <h2 className="text-3xl font-bold flex items-center gap-4 text-emerald-400 mb-2">
                        <Activity className="w-10 h-10" />
                        Planta Digital (GVT-01)
                    </h2>

                    {/* Machine Status Card */}
                    <div className="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-[100px] pointer-events-none"></div>
                        <h3 className="text-slate-400 font-medium text-xl uppercase tracking-wider mb-8">Estado de la Máquina</h3>
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center animate-pulse">
                                    <div className="w-12 h-12 bg-emerald-500 rounded-full shadow-[0_0_20px_#10b981]"></div>
                                </div>
                            </div>
                            <div>
                                <p className="text-5xl font-black text-white">{machineState}</p>
                                <p className="text-emerald-400 text-xl font-medium mt-1">Conectado vía OPC-UA</p>
                            </div>
                        </div>
                    </div>

                    {/* Sensor Grid */}
                    <div className="grid grid-cols-2 gap-6 flex-1">
                        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500"></div>
                            <Gauge className="w-12 h-12 text-cyan-400 mb-4" />
                            <p className="text-slate-400 text-lg uppercase tracking-wide font-medium">Velocidad</p>
                            <p className="text-5xl font-black font-mono text-white mt-2">{speed}<span className="text-2xl text-slate-500 ml-1">m/min</span></p>
                        </div>

                        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500"></div>
                            <Thermometer className="w-12 h-12 text-amber-500 mb-4" />
                            <p className="text-slate-400 text-lg uppercase tracking-wide font-medium">Temp. Rodillos</p>
                            <p className="text-5xl font-black font-mono text-white mt-2">{temperature}<span className="text-2xl text-slate-500 ml-1">°C</span></p>
                        </div>

                        <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-colors col-span-2">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-purple-500"></div>
                            <div className="flex w-full items-center justify-between px-4">
                                <div className="flex items-center gap-4">
                                    <Zap className="w-14 h-14 text-purple-400" />
                                    <div className="text-left">
                                        <p className="text-slate-400 text-xl uppercase tracking-wide font-medium">OEE Real-Time</p>
                                        <p className="text-slate-500 text-sm">Efectividad Global</p>
                                    </div>
                                </div>
                                <p className="text-6xl font-black font-mono text-white">{oee}<span className="text-4xl text-slate-500 ml-1">%</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Formats Selection */}
                <div className="xl:w-2/3 flex flex-col">
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-slate-200">
                        <Factory className="w-10 h-10 text-emerald-500" />
                        {t('select_format_title')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto pb-8 pr-2 custom-scrollbar">
                        {availableProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-slate-800 border border-slate-700 rounded-3xl p-8 flex flex-col hover:border-emerald-500/50 transition-all shadow-xl group"
                            >
                                <div className="flex-1 mb-10">
                                    <h3 className="text-4xl font-bold text-slate-100 mb-4 leading-tight group-hover:text-emerald-400 transition-colors">
                                        {product.product[i18n.language] || product.product['pt']}
                                    </h3>
                                    <p className="text-2xl text-slate-400 leading-relaxed">
                                        {product.description[i18n.language] || product.description['pt']}
                                    </p>
                                    <div className="mt-8 inline-block bg-slate-900 px-4 py-2 rounded-xl text-slate-300 text-lg font-medium border border-slate-700">
                                        {t('setup_steps_count', { count: product.steps.length })}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleStartSetup(product.id)}
                                    className="w-full h-24 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-3xl font-bold rounded-2xl transition-colors duration-200 flex items-center justify-center gap-4 shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-[0.98]"
                                >
                                    <PlayCircle className="w-10 h-10" />
                                    {t('start_setup_btn')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

        </div>
    );
}
