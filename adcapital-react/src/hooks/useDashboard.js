import { useState, useEffect, useCallback } from 'react';
import api from '../api/config';

export function useDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const carregarResumo = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await api.get('/dashboard/resumo/');
            setData(res.data);
        } catch (err) {
            console.error("Erro ao carregar resumo do dashboard:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarResumo();
    }, [carregarResumo]);

    return { 
        data,
        homeData: data?.home || {},
        analyticsData: data?.analytics || {},
        loading, 
        error, 
        retry: carregarResumo 
    };
}
