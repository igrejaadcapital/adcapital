import { useState, useEffect, useCallback } from 'react';
import membroService from '../../api/membroService';

export function useMembros() {
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [busca, setBusca] = useState('');
    const [funcoes, setFuncoes] = useState([]);
    const [graus, setGraus] = useState([]);

    const carregarDados = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const [m, f, g] = await Promise.all([
                membroService.listar(),
                membroService.getFuncoes(),
                membroService.getGraus()
            ]);
            setMembros(m.data);
            setFuncoes(f.data);
            setGraus(g.data);
        } catch (err) {
            console.error("Erro ao carregar dados do servidor:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const membrosFiltrados = membros.filter(m =>
        (m.nome?.toLowerCase().includes(busca.toLowerCase())) ||
        (m.funcao?.toLowerCase().includes(busca.toLowerCase()))
    );

    return { 
        membros, 
        membrosFiltrados, 
        busca, 
        setBusca, 
        funcoes, 
        graus, 
        carregarDados,
        loading,
        error
    };
}
