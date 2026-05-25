// src/components/ModalCadastro/MembroFormModal.jsx
import React from 'react';
import MembroFormFields from '../MembroFormFields';

export default function MembroFormModal({ formData, handleChange, funcoes }) {
    return (
        <MembroFormFields 
            formData={formData}
            handleChange={handleChange}
            funcoes={funcoes}
            isPublic={false}
        />
    );
}