import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
  requireText,
  requireTextLabel,
  normalizeRequireText = (value) => value.trim(),
}) {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (!open) setTypedText('');
  }, [open]);

  if (!open) return null;

  const textOk = !requireText
    || normalizeRequireText(typedText) === normalizeRequireText(requireText);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
        <h2 id="confirm-dialog-title" className="text-xl font-black text-slate-800 tracking-tight">
          {title}
        </h2>
        {message && (
          <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600 whitespace-pre-line">
            {message}
          </p>
        )}
        {requireText && (
          <div className="mt-6 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {requireTextLabel || 'Digite para confirmar'}
            </label>
            <input
              type="text"
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              disabled={loading}
              autoComplete="off"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
              placeholder={requireText}
            />
          </div>
        )}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || !textOk}
            className={`rounded-2xl px-6 py-3 text-sm font-black text-white transition disabled:opacity-50 flex items-center justify-center gap-2 ${
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
