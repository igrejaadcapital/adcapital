import React from 'react';
import { SettingsBox } from './settingsUi';

export default function SettingsGeralTab({
  funcoes,
  categoriasEntrada,
  categoriasSaida,
  configuracaoService,
  carregarDados,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SettingsBox
        title="Funções"
        color="blue"
        data={funcoes}
        onAdd={(v) => configuracaoService.adicionarFuncao(v)
          .then(carregarDados)
          .catch((err) => alert(err.response?.data?.error || 'Erro ao salvar função.'))}
        onDelete={(id) => configuracaoService.excluirFuncao(id).then(carregarDados)}
      />
      <SettingsBox
        title="Categorias (+)"
        color="emerald"
        data={categoriasEntrada}
        onAdd={(v) => configuracaoService.adicionarCategoria({ nome: v, tipo: 'ENTRADA' })
          .then(carregarDados)
          .catch((err) => alert(err.response?.data?.error || 'Erro ao salvar categoria.'))}
        onDelete={(id) => configuracaoService.excluirCategoria(id).then(carregarDados)}
      />
      <SettingsBox
        title="Categorias (-)"
        color="rose"
        data={categoriasSaida}
        onAdd={(v) => configuracaoService.adicionarCategoria({ nome: v, tipo: 'SAIDA' })
          .then(carregarDados)
          .catch((err) => alert(err.response?.data?.error || 'Erro ao salvar categoria.'))}
        onDelete={(id) => configuracaoService.excluirCategoria(id).then(carregarDados)}
      />
    </div>
  );
}
