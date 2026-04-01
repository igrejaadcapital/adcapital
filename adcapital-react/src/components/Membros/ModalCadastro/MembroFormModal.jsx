// src/components/ModalCadastro/MembroFormModal.jsx
import React from 'react';
import MembroFormFields from '../MembroFormFields';

export default function MembroFormModal({ formData, handleChange, funcoes, aplicarMascaraTelefone }) {
    return (
        <MembroFormFields 
            formData={formData}
            handleChange={handleChange}
            funcoes={funcoes}
            aplicarMascaraTelefone={aplicarMascaraTelefone}
            isPublic={false} // Administradores veem todos os campos
        />
    );
}