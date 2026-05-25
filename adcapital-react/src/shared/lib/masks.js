/** Máscaras e formatação para CPF e telefone (mobile-friendly). */

export function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

export function maskCpf(value) {
  let v = onlyDigits(value);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return v.substring(0, 14);
}

export function maskPhone(value) {
  let v = onlyDigits(value);
  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
    return v.substring(0, 14);
  }
  v = v.replace(/^(\d{2})(\d)/, '($1) $2');
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  return v.substring(0, 16);
}

export function formatCpf(cpf) {
  if (!cpf) return '---';
  const clean = onlyDigits(cpf);
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
