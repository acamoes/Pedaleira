# Pedaleira

Monta a tua pedalboard virtual com os pedais que tens, **ouve** o som que sai do
amplificador depois de processado pela cadeia, e descobre a regulação mais
parecida para soar como qualquer música.

100% local — **não faz chamadas a nenhuma IA nem precisa de chave de API**.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS (estética sketch a preto e branco)
- Zustand (estado global)
- Web Audio API (síntese do strum + cadeia de efeitos + visualização)
- @dnd-kit / drag livre
- Persistência em localStorage

---

## Correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). Não há nada para configurar.

Build de produção:

```bash
npm run build
```

Os ficheiros ficam em `dist/` — serve com qualquer hosting estático.

---

## Como funciona

### 1. Os teus pedais
Clica **+ Pedal** e escolhe da lista de modelos reconhecidos, ou escreve o nome.
Modelos desconhecidos entram como pedal genérico editável (tipo, cor, knobs).

### 2. Ouvir (Play)
Clica **Play**: a app sintetiza um acorde de Mi maior, processa-o pela cadeia de
pedais **ligados** (pela ordem) e reproduz a saída do amplificador. O gráfico do
sinal anima-se e fica verde enquanto há som — assim percebes na prática o efeito
de cada pedal (liga/desliga, regula os knobs e ouve a diferença).

### 3. Aproximar uma música
Na barra lateral escreve a música, clica **Gerar pergunta** e leva o texto a
qualquer LLM externo. Cola a resposta na app: ela monta a cadeia (ordem + bypass)
e regula os knobs dos teus pedais para soar o mais parecido possível.

### Outras
- Reordenar/posicionar pedais livremente (com snap); duplicar; bypass por pedal
- Ligar/Desligar todos · cores por pedal · tooltips nos knobs · avisos de ordem
- Guardar setups · exportar/importar JSON · exportar PNG da cadeia
- Tema claro/escuro · histórico de músicas

---

## Alguns pedais reconhecidos

Ibanez Tube Screamer (Mini/TS9/TS808), Boss DS-1, MXR Carbon Copy, Strymon
BigSky/Timeline, Dunlop Cry Baby, Boss BD-2, EHX Big Muff/Soul Food, Boss CH-1,
MXR Dyna Comp/Phase 90, Boss DD-3/RV-6/RE-2, TC Electronic (Afterglow, Hall of
Fame 2, Dark Matter, Sub'N'Up Mini, Flashback, Forcefield, June-60, PolyTune 3),
Boss RC-30, Pro Co RAT 2, Behringer SF300, Klon Centaur, Fulltone OCD, JHS
Morning Glory, Wampler Tumnus, Walrus Julia, Eventide H9, e mais.
