import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCcw, Loader2, Wifi } from 'lucide-react';

/**
 * StatusView - Componente universal para feedback de Carregamento e Erro.
 * 
 * @param {boolean} loading - Se verdadeiro, exibe o spinner de carregamento.
 * @param {boolean} error - Se verdadeiro, exibe a tela de erro (prioritário sobre loading).
 * @param {string} message - Mensagem principal de erro.
 * @param {string} subMessage - Mensagem secundária (explicação).
 * @param {function} onRetry - Função disparada ao clicar em "Tentar Novamente".
 * @param {boolean} fullPage - Se verdadeiro, ocupa a tela inteira (fixed). Caso contrário, relativo ao pai.
 * @param {boolean} autoRetry - Se verdadeiro, faz retry automático após countdown.
 * @param {number} autoRetryDelay - Delay em segundos para auto-retry (default: 10).
 */
export default function StatusView({ 
    loading, 
    error, 
    message = "O servidor demorou a responder", 
    subMessage = "Isso acontece às vezes quando o sistema fica muito tempo parado (Cold Start).", 
    onRetry, 
    fullPage = false,
    autoRetry = false,
    autoRetryDelay = 10
}) {
    const [countdown, setCountdown] = useState(autoRetryDelay);

    // Auto-retry com contagem regressiva
    useEffect(() => {
        if (!error || !onRetry || !autoRetry) return;
        setCountdown(autoRetryDelay);
        
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onRetry();
                    return autoRetryDelay;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, [error, autoRetry, autoRetryDelay, onRetry]);

    // Se não houver erro nem carregamento, não renderiza nada.
    if (!loading && !error) return null;

    // Estilos base para o container
    const containerClasses = fullPage 
        ? "fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/80 backdrop-blur-sm"
        : "absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-[2.5rem]";

    // Caso de Erro
    if (error) {
        return (
            <div className={containerClasses}>
                <div className="flex flex-col items-center justify-center p-10 bg-white rounded-[2.5rem] border border-rose-100 shadow-2xl space-y-6 max-w-md text-center animate-in zoom-in-95 duration-300">
                    <div className="bg-rose-50 p-4 rounded-full">
                        <AlertCircle size={48} className="text-rose-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest">{message}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 leading-relaxed">
                            {subMessage}
                        </p>
                    </div>
                    {onRetry && (
                        <div className="flex flex-col items-center gap-2">
                            <button 
                                onClick={onRetry}
                                className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                                {loading ? "Reconectando..." : "Tentar Novamente"}
                            </button>
                            {autoRetry && (
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <Wifi size={10} className="animate-pulse" />
                                    Reconectando automaticamente em {countdown}s...
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Caso de Carregamento (apenas se não houver erro)
    if (loading) {
        return (
            <div className={containerClasses}>
                <div className="flex flex-col items-center gap-4 bg-white/80 p-8 rounded-[2rem] shadow-sm border border-slate-50">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                        Sincronizando...
                    </span>
                </div>
            </div>
        );
    }

    return null;
}
