import stratocaster from '../../assets/stratocaster.svg'

// A guitarra: uma Stratocaster fixa (ilustração CC0) dentro de uma caixa, como os
// pedais e o amp. A ficha de saída fica no lado direito da caixa, a meia altura
// (a ficha interativa é desenhada pelo Pedalboard em GUITAR_BOX.jackY).

export const GUITAR_BOX = { w: 104, h: 320, jackY: 160 }

export function GuitarBox() {
  return (
    <div className="relative flex flex-col items-center rounded-[9px] border-2 border-ink bg-paper shadow-sketch select-none"
      style={{ width: GUITAR_BOX.w, height: GUITAR_BOX.h }}>
      <span className="mt-1.5 font-mono text-[8px] uppercase tracking-wide border border-current/40 px-1 text-ink opacity-70">
        Guitarra
      </span>
      <img src={stratocaster} alt="Fender Stratocaster" draggable={false}
        className="mt-1 flex-1 min-h-0 object-contain" style={{ height: 280 }} />
      <span className="absolute right-1.5 font-mono text-[7px] uppercase tracking-wide text-ink opacity-70"
        style={{ top: GUITAR_BOX.jackY - 18 }}>
        Out
      </span>
    </div>
  )
}
