import { shallow } from 'zustand/shallow'
import { useCallback } from 'react'
import { YarnStore, useYarnStore } from '../store'

export const useYarnStorage = () => useYarnStore(state => {
  return {
    get: state.get,
    set: state.set
  }
}, () => true)

export const useStorage = () => useYarnStore(state => state.storage, shallow)
export const useStorageItemValue = (key: string) => useYarnStore(useCallback((state) => state.storage[key], [key]))
export const useSetStorageItemValue = (key: string) => useYarnStore(useCallback((state) => {
  return (value: YarnStore['storage'][string]) => state.set(key, value)
}, [key]), () => false)

export const useStorageItem = (key: string) => {
  const value = useStorageItemValue(key);
  const setValue = useSetStorageItemValue(key);
  return [value, setValue] as const
}

export const useNode = () => {
  return useYarnStore(state => [state.node, state.setNode] as const, shallow)
}

export const useOptions = () => {
  return useYarnStore(state => state.options, shallow)
}