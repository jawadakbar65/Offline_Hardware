import { useContext } from 'react'
import { AppContext } from './storeContext'

export function useHardwareStore() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useHardwareStore must be used within AppProvider')
  }

  return context
}
