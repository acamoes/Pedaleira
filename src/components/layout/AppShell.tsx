import { Header } from './Header'
import { Pedalboard } from '../board/Pedalboard'
import { Sidebar } from '../sidebar/Sidebar'

// Filtro SVG que simula pincelada grossa e rugosa no título.
// feMorphology "dilata" os traços da fonte antes de os distorcer.
// feDisplacementMap com scale alto cria arestas irregulares de pincel.
function BrushFilter() {
  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      aria-hidden
    >
      <defs>
        <filter id="brush-roughen" x="-18%" y="-40%" width="136%" height="180%">
          {/* Engrossa os traços como um pincel largo */}
          <feMorphology
            in="SourceGraphic"
            operator="dilate"
            radius="2"
            result="fat"
          />
          {/* Ruído fractal anisotrópico — mais rugoso na horizontal */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.07"
            numOctaves="5"
            seed="8"
            result="noise"
          />
          {/* Deslocamento forte → arestas rasgadas de pincel */}
          <feDisplacementMap
            in="fat"
            in2="noise"
            scale="12"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}

export function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-paper overflow-hidden">
      <BrushFilter />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 p-5 overflow-y-auto flex flex-col">
          <Pedalboard />
        </main>
        <Sidebar />
      </div>
    </div>
  )
}
