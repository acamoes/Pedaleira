import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { usePedalboardStore } from './store/usePedalboardStore'

export default function App() {
  const theme = usePedalboardStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return <AppShell />
}
