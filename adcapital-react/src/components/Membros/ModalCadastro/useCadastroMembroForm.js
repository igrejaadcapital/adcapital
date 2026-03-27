import { useState, useEffect } from 'react';
import membroService from '../../../api/membroService';

export function useCadastroMembroForm(membro, membros, graus, onClose, onSuccess) {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        funcao: 'Membro',
        cpf: '',
        data_nascimento: '',
        data_entrada: '',
        data_saida: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'Brasília',
        uf: 'DF',
        cep: '',
        observacoes: '',
        parentescos_novo: []
    });

    const [indiceFoco, setIndiceFoco] = useState(null);

    useEffect(() => {
        if (membro) {
            const formatados = (membro.parentes || []).map(p => ({
                id: p.id,
                parente_id: p.parente_id || p.membro_destino || '',
                busca_termo: p.nome_parente || '',
                grau: p.grau || ''
            }));
            setFormData({ ...membro, parentescos_novo: formatados });
        }
    }, [membro]);

    const handleChange = (campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
    };

    const aplicarMascaraTelefone = (v) => {
        if (!v) return "";
        v = v.replace(/\D/g, "");
        v = v.replace(/(\d{2})(\d)/, "($1) $2");
        v = v.replace(/(\d{5})(\d)/, "$1-$2");
        return v.substring(0, 15);
    };

    const adicionarParentesco = () => {
        setFormData(prev => ({
            ...prev,
            parentescos_novo: [...prev.parentescos_novo, { parente_id: '', grau: '', busca_termo: '' }]
        }));
    };

    const removerParentesco = (index) => {
        setFormData(prev => ({
            ...prev,
            parentescos_novo: prev.parentescos_novo.filter((_, i) => i !== index)
        }));
        setIndiceFoco(null);
    };

    const atualizarParentesco = (index, campo, valor) => {
        const novos = [...formData.parentescos_novo];
        novos[index][campo] = valor;
        setFormData(prev => ({ ...prev, parentescos_novo: novos }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const parentescosValidos = formData.parentescos_novo
                .filter(p => p.parente_id && p.grau)
                .map(p => ({
                    id: p.id,
                    membro_destino: p.parente_id,
                    grau: p.grau
                }));

            const payload = {
                ...formData,
                parentescos_novo: parentescosValidos
            };

            await membroService.salvar(formData.id, payload);

            if (onSuccess) await onSuccess();
            if (onClose) onClose();
        } catch (err) {
            console.error("Erro ao salvar:", err.response?.data);
            alert("Erro ao salvar: " + JSON.stringify(err.response?.data || "Erro de conexão"));
        }
    };

    const getNomeGrau = (grauId) => {
        const grauEncontrado = graus?.find(g => g.id === grauId);
        return grauEncontrado ? grauEncontrado.nome : grauId;
    };

    return {
        formData,
        setFormData,
        handleChange,
        aplicarMascaraTelefone,
        adicionarParentesco,
        removerParentesco,
        atualizarParentesco,
        indiceFoco,
        setIndiceFoco,
        handleSubmit,
        getNomeGrau
    };
}
