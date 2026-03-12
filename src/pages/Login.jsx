import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Factory, Lock, ShieldCheck, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const handleKeyPress = (num) => {
        if (error) setError(false);
        if (pin.length < 4) {
            setPin(prev => prev + num);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        if (error) setError(false);
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (login(pin)) {
            navigate('/dashboard');
        } else {
            setError(true);
            setPin('');
        }
    };

    const toggleLanguage = () => {
        const langs = ['pt', 'es', 'en'];
        const nextLang = langs[(langs.indexOf(i18n.language) + 1) % langs.length];
        i18n.changeLanguage(nextLang);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-white font-sans select-none relative overflow-hidden">

            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Language Toggle */}
            <div className="absolute top-8 right-8 z-20">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-3 bg-slate-800/80 hover:bg-slate-700 active:bg-slate-600 px-6 py-4 rounded-2xl text-xl font-bold transition-colors border border-slate-700 backdrop-blur"
                >
                    <Globe className="w-6 h-6 text-emerald-500" />
                    {t(`language_${i18n.language}`)}
                </button>
            </div>

            <div className="flex w-full max-w-6xl gap-16 items-center z-10">
                {/* Left Side: Branding */}
                <div className="flex-1 hidden md:flex flex-col">
                    <div className="flex items-center gap-6 mb-8 text-emerald-400">
                        <Factory className="w-24 h-24" />
                    </div>
                    <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 leading-tight">
                        {t('app_title')}
                    </h1>
                    <p className="text-3xl text-slate-400 leading-relaxed max-w-md">
                        {t('app_subtitle')}
                    </p>
                    <div className="mt-12 flex items-center gap-4 text-slate-500 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 inline-flex">
                        <ShieldCheck className="w-8 h-8 text-cyan-500" />
                        <span className="text-xl font-medium tracking-wide">Industria 4.0 Secure Access</span>
                    </div>
                </div>

                {/* Right Side: PIN Pad */}
                <div className="w-full max-w-md bg-slate-800 p-10 rounded-[2.5rem] border border-slate-700 shadow-2xl relative">

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-white mb-3">{t('login_title')}</h2>
                        <p className="text-slate-400 text-lg">{t('login_subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                        {/* PIN Display */}
                        <div className="relative">
                            <input
                                type="password"
                                value={pin}
                                readOnly
                                className={`w-full bg-slate-900 border-2 ${error ? 'border-red-500' : 'border-slate-700 focus:border-emerald-500'} rounded-2xl py-6 text-center text-5xl font-mono tracking-[1em] text-white shadow-inner outline-none transition-colors h-24`}
                                placeholder="****"
                            />
                            <Lock className={`absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 ${error ? 'text-red-500' : (pin.length > 0 ? 'text-emerald-500' : 'text-slate-500')} transition-colors`} />
                        </div>

                        {error && (
                            <p className="text-red-400 text-center font-medium animate-pulse">{t('login_error')}</p>
                        )}

                        {/* Numeric Keypad */}
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => handleKeyPress(num)}
                                    className="h-20 bg-slate-700 hover:bg-slate-600 active:bg-emerald-600 active:text-white rounded-2xl text-3xl font-medium transition-colors border border-slate-600 hover:border-slate-500"
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setPin('')}
                                className="h-20 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-red-400 rounded-2xl text-xl font-bold transition-colors border border-slate-700"
                            >
                                C
                            </button>
                            <button
                                type="button"
                                onClick={() => handleKeyPress(0)}
                                className="h-20 bg-slate-700 hover:bg-slate-600 active:bg-emerald-600 active:text-white rounded-2xl text-3xl font-medium transition-colors border border-slate-600 hover:border-slate-500"
                            >
                                0
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="h-20 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 rounded-2xl text-xl font-bold transition-colors border border-slate-700"
                            >
                                DEL
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={pin.length === 0}
                            className="w-full mt-4 h-20 bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-emerald-500 active:bg-emerald-700 text-white text-2xl font-bold rounded-2xl transition-all shadow-lg disabled:shadow-none"
                        >
                            {t('login_btn')}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
