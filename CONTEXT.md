# Pedaleira

Pedaleira virtual de guitarra: o utilizador monta os pedais que tem, liga-os com cabos e
regula-os para se aproximar do som de uma música.

## Language

**Pedal**:
Um pedal de efeito que o utilizador possui, com os seus knobs e switches, colocado na board.
_Avoid_: efeito (quando se fala do objeto), unidade

**Cabo**:
Ligação entre a saída de uma tomada e a entrada de outra (guitarra, pedal ou amplificador).
_Avoid_: ligação, patch

**Cadeia**:
A sequência ordenada de pedais pela qual o som passa, da guitarra ao amplificador, dada pelos cabos.
_Avoid_: chain, sinal

**Setup**:
A board completa com nome — todos os pedais (com ou sem cabo), as suas posições e regulações — que se guarda e carrega.
_Avoid_: configuração, preset, board (quando se fala do que se guarda)

**Música**:
A música para a qual um Setup está regulado, escrita "Artista — Música". Pertence ao Setup; é definida ao aplicar uma afinação ou à mão, e mantém-se mesmo que se ajustem knobs depois.
_Avoid_: canção, tema, song

**Ficha de regulação**:
Folha imprimível da Cadeia ativa: cada pedal por ordem, com os knobs desenhados na posição atual, switches e seletores, para reproduzir o som na pedaleira real.
_Avoid_: export, print, PNG

**Onda do pedal**:
Imagem, no cartão de cada pedal, do que esse pedal faz isoladamente a uma nota limpa de
guitarra, conforme os seus knobs e seletores atuais. A vista depende do tipo de efeito
(forma de onda, ecos no tempo, curva de frequência…).
_Avoid_: sinal, waveform, visualização da cadeia
