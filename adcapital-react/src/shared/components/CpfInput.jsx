import { maskCpf } from '../lib/masks';

const defaultClass =
  'w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono';

export default function CpfInput({
  value,
  onChange,
  className = defaultClass,
  placeholder = '000.000.000-00',
  required,
  disabled,
  id,
  name,
  autoComplete = 'off',
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete={autoComplete}
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      value={value ?? ''}
      maxLength={14}
      onChange={(e) => onChange(maskCpf(e.target.value))}
    />
  );
}
