import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type {
  Pedal,
  PedalboardSetup,
  TuneResult,
  IdentifyPedalResponse,
  TunePedalsResponse,
} from '../types'
import {
  loadSavedSetups,
  saveSavedSetups,
  loadCurrentSetup,
  saveCurrentSetup,
} from '../utils/localStorage'

// Canvas constants (shared with Pedalboard)
export const CANVAS_H = 420
export const PEDAL_W  = 120
export const PEDAL_H  = 170

type Theme = 'light' | 'dark'
function loadTheme(): Theme {
  return (localStorage.getItem('pedaleira:theme') as Theme) ?? 'light'
}

export interface SongHistoryEntry {
  song: string
  artist: string
  response: TunePedalsResponse
  orderedIds: string[]
  appliedAt: number
}
const HISTORY_KEY = 'pedaleira:song-history'
function loadHistory(): SongHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as SongHistoryEntry[]) : []
  } catch {
    return []
  }
}

function makeEmptySetup(): PedalboardSetup {
  return { id: uuidv4(), name: 'Novo Setup', pedals: [], createdAt: Date.now(), updatedAt: Date.now() }
}

function defaultX(index: number) { return 110 + (index % 4) * 155 }
function defaultY() { return Math.floor((CANVAS_H - PEDAL_H) / 2) }   // centrado verticalmente

// Valida/normaliza o valor de um knob: dentro do intervalo e arredondado a 1 casa
function clampKnob(value: number, min: number, max: number): number {
  const v = Math.max(min, Math.min(max, value))
  return Math.round(v * 10) / 10
}

function pedalFromIdentify(
  modelName: string,
  data: IdentifyPedalResponse,
  index: number,
): Pedal {
  return {
    id: uuidv4(),
    modelName,
    brand: data.brand,
    model: data.model,
    type: data.type,
    recognized: data.recognized,
    enabled: false,   // pedais começam "não ligados" (sem cabo, em bypass)
    color: data.color ?? '',
    x: defaultX(index),
    y: defaultY(),
    knobs: data.knobs.map((k) => ({ ...k, value: k.default })),
    switches: data.switches.map((s) => ({ ...s, value: s.default })),
  }
}

// Migração única: desligar pedais já guardados (novo fluxo "começam não ligados").
// Corre só uma vez graças à flag em localStorage.
const BYPASS_MIGRATION_KEY = 'pedaleira:migrated-bypass-v1'
const needsBypassMigration = !localStorage.getItem(BYPASS_MIGRATION_KEY)

// Migra pedais antigos do localStorage que não têm x, y, color
function migratePedal(p: Pedal, index: number): Pedal {
  const raw = p as Pedal & { x?: number; y?: number; color?: string }
  return {
    ...p,
    color: raw.color ?? '',
    x: raw.x !== undefined ? raw.x : defaultX(index),
    y: raw.y !== undefined ? raw.y : defaultY(),
    // só na migração única: força todos a desligados
    enabled: needsBypassMigration ? false : p.enabled,
  }
}

interface Store {
  theme: Theme
  toggleTheme: () => void

  currentSetup: PedalboardSetup
  savedSetups: PedalboardSetup[]
  tuneResult: TuneResult | null
  songHistory: SongHistoryEntry[]
  highlightedKnobs: string[]   // chaves `${pedalId}:${knobName}` recém-alteradas
  isIdentifying: boolean

  addPedal: (modelName: string, data: IdentifyPedalResponse) => void
  removePedal: (pedalId: string) => void
  duplicatePedal: (pedalId: string) => void
  movePedal: (pedalId: string, x: number, y: number) => void
  updatePedalColor: (pedalId: string, color: string) => void
  togglePedalEnabled: (pedalId: string) => void
  setAllEnabled: (enabled: boolean) => void
  updateKnobValue: (pedalId: string, knobName: string, value: number) => void
  updateSwitchValue: (pedalId: string, switchName: string, value: boolean) => void
  importSetup: (setup: PedalboardSetup) => void
  loadFromHistory: (entry: SongHistoryEntry) => void
  clearHistory: () => void

  renameCurrentSetup: (name: string) => void
  saveCurrentAsSetup: () => void
  loadSetup: (setupId: string) => void
  deleteSetup: (setupId: string) => void

  setIsIdentifying: (v: boolean) => void
  applyParsedTune: (response: TunePedalsResponse, orderedIds: string[]) => void
  clearTuneResult: () => void
}

export const usePedalboardStore = create<Store>((set, get) => {
  const rawCurrent  = loadCurrentSetup() ?? makeEmptySetup()
  const persistedCurrent: PedalboardSetup = {
    ...rawCurrent,
    pedals: rawCurrent.pedals.map(migratePedal),
  }
  const rawSetups = loadSavedSetups()
  const persistedSetups = rawSetups.map((s) => ({
    ...s,
    pedals: s.pedals.map(migratePedal),
  }))

  // Marca a migração como feita para não voltar a desligar em recargas futuras
  if (needsBypassMigration) localStorage.setItem(BYPASS_MIGRATION_KEY, '1')

  function persist() {
    const { currentSetup, savedSetups } = get()
    saveCurrentSetup(currentSetup)
    saveSavedSetups(savedSetups)
  }

  return {
    theme: loadTheme(),
    toggleTheme() {
      const next = get().theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('pedaleira:theme', next)
      set({ theme: next })
    },

    currentSetup: persistedCurrent,
    savedSetups: persistedSetups,
    tuneResult: null,
    songHistory: loadHistory(),
    highlightedKnobs: [],
    isIdentifying: false,

    addPedal(modelName, data) {
      const index = get().currentSetup.pedals.length
      const pedal = pedalFromIdentify(modelName, data, index)
      set((s) => ({
        currentSetup: { ...s.currentSetup, pedals: [...s.currentSetup.pedals, pedal], updatedAt: Date.now() },
      }))
      persist()
    },

    removePedal(pedalId) {
      set((s) => ({
        currentSetup: {
          ...s.currentSetup,
          pedals: s.currentSetup.pedals.filter((p) => p.id !== pedalId),
          updatedAt: Date.now(),
        },
        tuneResult: null,
      }))
      persist()
    },

    duplicatePedal(pedalId) {
      set((s) => {
        const src = s.currentSetup.pedals.find((p) => p.id === pedalId)
        if (!src) return s
        const copy: Pedal = {
          ...src,
          id: uuidv4(),
          x: src.x + 24,
          y: src.y + 24,
          knobs: src.knobs.map((k) => ({ ...k })),
          switches: src.switches.map((sw) => ({ ...sw })),
        }
        return {
          currentSetup: {
            ...s.currentSetup,
            pedals: [...s.currentSetup.pedals, copy],
            updatedAt: Date.now(),
          },
        }
      })
      persist()
    },

    setAllEnabled(enabled) {
      set((s) => ({
        currentSetup: {
          ...s.currentSetup,
          pedals: s.currentSetup.pedals.map((p) => ({ ...p, enabled })),
          updatedAt: Date.now(),
        },
      }))
      persist()
    },

    movePedal(pedalId, x, y) {
      set((s) => ({
        currentSetup: {
          ...s.currentSetup,
          pedals: s.currentSetup.pedals.map((p) => p.id === pedalId ? { ...p, x, y } : p),
          updatedAt: Date.now(),
        },
      }))
      persist()
    },

    updatePedalColor(pedalId, color) {
      set((s) => ({
        currentSetup: {
          ...s.currentSetup,
          pedals: s.currentSetup.pedals.map((p) => p.id === pedalId ? { ...p, color } : p),
          updatedAt: Date.now(),
        },
      }))
      persist()
    },

    togglePedalEnabled(pedalId) {
      set((s) => ({
        currentSetup: {
          ...s.currentSetup,
          pedals: s.currentSetup.pedals.map((p) => p.id === pedalId ? { ...p, enabled: !p.enabled } : p),
          updatedAt: Date.now(),
        },
      }))
      persist()
    },

    updateKnobValue(pedalId, knobName, value) {
      set((s) => ({
        currentSetup: {
          ...s.currentSetup,
          pedals: s.currentSetup.pedals.map((p) =>
            p.id === pedalId
              ? { ...p, knobs: p.knobs.map((k) => k.name === knobName ? { ...k, value: clampKnob(value, k.min, k.max) } : k) }
              : p,
          ),
          updatedAt: Date.now(),
        },
      }))
      persist()
    },

    updateSwitchValue(pedalId, switchName, value) {
      set((s) => ({
        currentSetup: {
          ...s.currentSetup,
          pedals: s.currentSetup.pedals.map((p) =>
            p.id === pedalId
              ? { ...p, switches: p.switches.map((sw) => sw.name === switchName ? { ...sw, value } : sw) }
              : p,
          ),
          updatedAt: Date.now(),
        },
      }))
      persist()
    },

    renameCurrentSetup(name) {
      set((s) => ({ currentSetup: { ...s.currentSetup, name, updatedAt: Date.now() } }))
      persist()
    },

    saveCurrentAsSetup() {
      const { currentSetup, savedSetups } = get()
      const existing = savedSetups.findIndex((s) => s.id === currentSetup.id)
      const updated = existing !== -1
        ? savedSetups.map((s) => s.id === currentSetup.id ? currentSetup : s)
        : [...savedSetups, currentSetup]
      set({ savedSetups: updated })
      persist()
    },

    loadSetup(setupId) {
      const setup = get().savedSetups.find((s) => s.id === setupId)
      if (setup) { set({ currentSetup: setup, tuneResult: null }); persist() }
    },

    deleteSetup(setupId) {
      set((s) => ({ savedSetups: s.savedSetups.filter((x) => x.id !== setupId) }))
      persist()
    },

    setIsIdentifying: (v) => set({ isIdentifying: v }),

    applyParsedTune(response, orderedIds) {
      const highlights: string[] = []
      set((s) => {
        const rowY = Math.floor((CANVAS_H - PEDAL_H) / 2)
        const startX = 110
        const spacing = PEDAL_W + 36
        const orderIndex = new Map(orderedIds.map((id, i) => [id, i]))

        const updatedPedals = s.currentSetup.pedals.map((pedal) => {
          const setting = response.settings.find((st) => st.pedalId === pedal.id)
          const pos = orderIndex.get(pedal.id)

          let next = pedal
          if (setting) {
            next = {
              ...next,
              enabled: setting.enabled,
              knobs: next.knobs.map((k) => {
                const v = setting.knobs[k.name]
                if (v === undefined) return k
                const nv = clampKnob(v, k.min, k.max)
                if (nv !== k.value) highlights.push(`${pedal.id}:${k.name}`)
                return { ...k, value: nv }
              }),
              switches: next.switches.map((sw) => {
                const v = setting.switches?.[sw.name]
                return v !== undefined ? { ...sw, value: v } : sw
              }),
            }
          }
          // Reposiciona os pedais ativos pela ordem da resposta (liga-os em cadeia)
          if (pos !== undefined) {
            next = { ...next, x: startX + pos * spacing, y: rowY }
          }
          return next
        })

        return {
          currentSetup: { ...s.currentSetup, pedals: updatedPedals, updatedAt: Date.now() },
          tuneResult: { response, appliedAt: Date.now() },
          highlightedKnobs: highlights,
        }
      })
      scheduleHighlightClear()
      pushHistory(response, orderedIds)
      persist()
    },

    importSetup(setup) {
      const migrated: PedalboardSetup = {
        ...setup,
        id: setup.id || uuidv4(),
        pedals: setup.pedals.map((p, i) => migratePedal(p, i)),
      }
      set({ currentSetup: migrated, tuneResult: null })
      persist()
    },

    loadFromHistory(entry) {
      get().applyParsedTune(entry.response, entry.orderedIds)
    },

    clearHistory() {
      localStorage.removeItem(HISTORY_KEY)
      set({ songHistory: [] })
    },

    clearTuneResult: () => set({ tuneResult: null }),
  }

  // ── helpers que dependem de set/get ──
  function scheduleHighlightClear() {
    setTimeout(() => set({ highlightedKnobs: [] }), 2500)
  }

  function pushHistory(response: TunePedalsResponse, orderedIds: string[]) {
    if (!response.song.trim()) return
    const entry: SongHistoryEntry = {
      song: response.song,
      artist: response.artist,
      response,
      orderedIds,
      appliedAt: Date.now(),
    }
    const key = `${entry.song}|${entry.artist}`.toLowerCase()
    const prev = get().songHistory.filter((e) => `${e.song}|${e.artist}`.toLowerCase() !== key)
    const next = [entry, ...prev].slice(0, 8)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
    set({ songHistory: next })
  }
})
