import type { PedalboardSetup } from '../types'

const SETUPS_KEY = 'pedaleira:setups'
const CURRENT_KEY = 'pedaleira:current'

export function loadSavedSetups(): PedalboardSetup[] {
  try {
    const raw = localStorage.getItem(SETUPS_KEY)
    return raw ? (JSON.parse(raw) as PedalboardSetup[]) : []
  } catch {
    return []
  }
}

export function saveSavedSetups(setups: PedalboardSetup[]): void {
  localStorage.setItem(SETUPS_KEY, JSON.stringify(setups))
}

export function loadCurrentSetup(): PedalboardSetup | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY)
    return raw ? (JSON.parse(raw) as PedalboardSetup) : null
  } catch {
    return null
  }
}

export function saveCurrentSetup(setup: PedalboardSetup): void {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(setup))
}
