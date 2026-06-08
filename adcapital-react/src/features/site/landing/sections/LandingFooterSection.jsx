import React from 'react';
import { Heart } from 'lucide-react';
import qrcode from '../../../../assets/qrcode.png';

const LandingFooterSection = ({ config }) => (
  <footer className="py-20 bg-slate-950 border-t border-slate-900">
    <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

      {/* Coluna 1: QR Code e Endereço */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
        <div className="bg-white p-3 rounded-[2rem] shadow-2xl overflow-hidden w-[200px] h-[200px] border-4 border-slate-900">
          <img
            src={qrcode}
            alt="QR Code"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <p className="text-white font-black text-2xl mb-1 uppercase tracking-tighter italic leading-none">AD CAPITAL</p>
          <p className="text-slate-500 max-w-[280px] text-xs font-bold leading-relaxed opacity-80">
            {config?.endereco_completo}
          </p>
        </div>
      </div>

      {/* Coluna 2: Ofertas e Dízimos (Centro) */}
      <div className="flex flex-col items-center py-4 lg:py-0 w-full">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-800 px-3 md:px-4 py-10 rounded-[3.5rem] shadow-2xl border border-white/20 w-full max-w-[500px] relative overflow-hidden group transition-all hover:scale-[1.02]">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <Heart className="w-12 h-12 mx-auto mb-6 text-white animate-pulse" />
          <h3 className="text-white font-black text-xl uppercase tracking-[0.3em] mb-10 text-center italic">Ofertas e Dízimos</h3>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md py-6 px-1 md:px-2 rounded-3xl border border-white/30 text-center shadow-inner w-full overflow-hidden">
              <span className="text-[10px] font-black text-blue-200 uppercase block mb-4 tracking-[0.4em]">CHAVE PIX</span>
              <p className="text-base md:text-lg font-black text-white select-all tracking-tighter whitespace-nowrap leading-none">
                {config?.pix_chave}
              </p>
            </div>
            <p className="text-sm text-blue-100 font-black uppercase text-center tracking-[0.3em] opacity-90">
              {config?.banco_nome}
            </p>
          </div>
        </div>
      </div>

      {/* Coluna 3: Logo e Direitos */}
      <div className="flex flex-col items-center lg:items-end text-center lg:text-right space-y-6">
        <img src="/logo.png" alt="Logo Footer" className="w-20 h-20 opacity-30 grayscale hover:grayscale-0 transition-all rounded-full object-cover shadow-2xl" />
        <div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">
            © 2026 AD CAPITAL
          </p>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest leading-loose">
            Direitos reservados<br />
            <span className="opacity-40">Desenvolvido pelo AntiGravity AI</span>
          </p>
        </div>
      </div>

    </div>
  </footer>
);

export default LandingFooterSection;
