// src/components/Financeiro/ModalLancamentosFinanceiro/useLancamentoFinanceiroForm.js
import { useState } from 'react';

export const useLancamentoFinanceiroForm = (tipo, onSave, onClose, categoriasProp, onAdicionarCategoria, lancamento) => {
    // Lista de categorias vinda do hook global; se não vier nada, usa os padrões por tipo
    const categoriasPadraoEntrada = ["Dízimos", "Ofertas", "Filantropia", "Rendimentos", "Outros"];
    const categoriasPadraoSaida = ["Água", "Luz", "Telefone", "Aluguel", "Condomínio", "Manutenção", "Obras", "Filantropia", "Outros"];

    const categoriasLista = (categoriasProp && categoriasProp.length > 0)
        ? categoriasProp
        : (tipo === 'ENTRADA' ? categoriasPadraoEntrada : categoriasPadraoSaida);

    const [novaCategoria, setNovaCategoria] = useState('');
    const [mostrarCampoNovo, setMostrarCampoNovo] = useState(false);
    const [valorExibicao, setValorExibicao] = useState(() => {
        const valor = lancamento?.valor ?? 0;
        return valor ? valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : "0,00";
    });

    const [formData, setFormData] = useState(() => ({
        data: lancamento?.data || new Date().toISOString().split('T')[0],
        categoria: lancamento?.sub || lancamento?.categoria || categoriasLista[0] || '',
        descricao: lancamento?.descricao || '',
        valor: lancamento?.valor || 0,
    }));

    // Lógica da Máscara de Moeda R$
    const handleValorChange = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        const options = { minimumFractionDigits: 2 };
        const formatado = new Intl.NumberFormat('pt-BR', options).format(
            parseFloat(value) / 100
        );

        setValorExibicao(formatado === "NaN" ? "0,00" : formatado);
        setFormData({ ...formData, valor: parseFloat(value) / 100 });
    };

    // Lógica para permitir inserir novos tipos
    const adicionarNovaCategoria = () => {
        if (novaCategoria.trim() === '') return;

        // Quem realmente "dona" da lista é o hook useCategoriasFinanceiras (via onAdicionarCategoria)
        if (onAdicionarCategoria) {
            onAdicionarCategoria(novaCategoria);
        }

        setFormData({ ...formData, categoria: novaCategoria });
        setNovaCategoria('');
        setMostrarCampoNovo(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        // Agora valida apenas se o valor é maior que zero
        if (formData.valor <= 0) {
            return alert("Por favor, informe um valor válido.");
        }

        onSave({
            id: lancamento?.id || Date.now(),
            ...formData,
            sub: formData.categoria,
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