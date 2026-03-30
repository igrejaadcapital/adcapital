import { useState } from 'react';

export const useLancamentoFinanceiroForm = (tipo, onSave, onClose, categoriasProp, onAdicionarCategoria, lancamento) => {
    const categoriasPadraoEntrada = ["Dízimos", "Ofertas", "Filantropia", "Rendimentos", "Outros"];
    const categoriasPadraoSaida = ["Água", "Luz", "Telefone", "Aluguel", "Condomínio", "Manutenção", "Obras", "Filantropia", "Outros"];

    const categoriasLista = (categoriasProp && categoriasProp.length > 0)
        ? categoriasProp
        : (tipo === 'ENTRADA' ? categoriasPadraoEntrada : categoriasPadraoSaida);

    const [novaCategoria, setNovaCategoria] = useState('');
    const [valorExibicao, setValorExibicao] = useState(() => {
        const valor = lancamento?.valor ?? 0;
        return valor ? valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "0,00";
    });

    const [formData, setFormData] = useState(() => ({
        data: lancamento?.data || new Date().toISOString().split('T')[0],
        categoria: lancamento?.categoria || (categoriasLista.length > 0 ? categoriasLista[0] : ''),
        descricao: lancamento?.descricao || '',
        valor: lancamento?.valor || 0,
        comprovante: null
    }));

    const handleValorChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        const options = { minimumFractionDigits: 2 };
        const formatado = new Intl.NumberFormat('pt-BR', options).format(
            parseFloat(value) / 100
        );

        setValorExibicao(formatado === "NaN" ? "0,00" : formatado);
        setFormData({ ...formData, valor: parseFloat(value) / 100 });
    };

    const adicionarNovaCategoria = () => {
        if (novaCategoria.trim() === '') return;
        if (onAdicionarCategoria) {
            onAdicionarCategoria(novaCategoria);
        }
        setFormData({ ...formData, categoria: novaCategoria });
        setNovaCategoria('');
        setMostrarCampoNovo(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.valor <= 0) {
            return alert("Por favor, informe um valor válido.");
        }

        onSave({
            ...formData,
            tipo: tipo
        });
    };

    return {
        formData,
        setFormData,
        categorias: categoriasLista,
        mostrarCampoNovo,
        setMostrarCampoNovo,
        novaCategoria,
        setNovaCategoria,
        valorExibicao,
        handleValorChange,
        adicionarNovaCategoria,
        handleSubmit
    };
};