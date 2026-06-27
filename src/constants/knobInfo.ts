// Descrições curtas por nome de knob (tooltip). Procura por correspondência
// parcial em lowercase para cobrir variações (Drive, Overdrive, Gain...).
const KNOB_INFO: Array<[RegExp, string]> = [
  [/drive|gain|overdrive|dist/, 'quantidade de saturação/distorção'],
  [/tone|treble|filter/, 'brilho — agudos vs. corpo'],
  [/bass/, 'quantidade de graves'],
  [/level|volume|output|e\.?level/, 'volume de saída do pedal'],
  [/mix|blend|d-v/, 'proporção entre sinal limpo e efeito'],
  [/depth/, 'profundidade da modulação'],
  [/rate|speed/, 'velocidade da modulação'],
  [/regen|feedback|f\.?back|repeats|intensity/, 'número de repetições/realimentação'],
  [/delay|time|d\.?time|echo/, 'tempo entre repetições'],
  [/decay/, 'duração da cauda de reverb'],
  [/pre/, 'pré-delay antes da reverb'],
  [/sustain/, 'sustain/compressão do sinal'],
  [/comp|sens/, 'quantidade de compressão'],
  [/sub/, 'nível da oitava abaixo'],
  [/\bup\b/, 'nível da oitava acima'],
  [/dry/, 'nível do sinal seco (sem efeito)'],
  [/reverb/, 'quantidade de reverb'],
  [/voice|mode|eq/, 'modo/timbre do efeito'],
]

export function knobInfo(name: string): string | undefined {
  const n = name.toLowerCase()
  for (const [re, desc] of KNOB_INFO) if (re.test(n)) return desc
  return undefined
}
