import { maskPhone } from '../lib/masks';

const defaultClass =
  'w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono';

export default function PhoneInput({
  value,
  onChange,
  className = defaultClass,
  placeholder = '(00) 00000-0000',
  required,
  disabled,
  id,
  name,
}) {
  return (
    <input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      id={id}
      name={name}
      required={required}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      value={value ?? ''}
      maxLength={16}
      onChange={(e) => onChange(maskPhone(e.target.value))}
    />
  );
}
