import { useState } from 'react';

const SIZES = {
  sm: { thumb: 'w-8 h-8', preview: 'w-32 h-32', offset: 'ml-2' },
  md: { thumb: 'w-12 h-12', preview: 'w-40 h-40', offset: 'ml-3' },
};

/**
 * Miniatura circular na lista; ao passar o mouse, abre prévia maior com
 * object-contain e padding (mostra mais da foto, sem cortar o rosto).
 */
export default function MembroFotoAvatar({ src, nome, size = 'sm' }) {
  const [aberto, setAberto] = useState(false);
  const s = SIZES[size] || SIZES.sm;

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setAberto(true)}
      onMouseLeave={() => setAberto(false)}
      onFocus={() => setAberto(true)}
      onBlur={() => setAberto(false)}
    >
      <img
        src={src}
        alt={nome}
        title="Passe o mouse para ampliar"
        className={`${s.thumb} rounded-full object-cover border border-slate-200 cursor-zoom-in ring-0 focus:ring-2 focus:ring-blue-400`}
        tabIndex={0}
      />
      {aberto && (
        <div
          className={`absolute left-full top-1/2 z-[60] -translate-y-1/2 ${s.offset} ${s.preview} rounded-2xl border-2 border-white bg-white p-2 shadow-2xl pointer-events-none`}
          aria-hidden
        >
          <img
            src={src}
            alt=""
            className="h-full w-full rounded-xl object-contain bg-slate-50"
          />
        </div>
      )}
    </div>
  );
}
