import { shallow } from 'zustand/shallow'
import { useYarnStore } from '../store'

export const useNode = () => {
  return useYarnStore(state => [state.node, state.setNode] as const, shallow)
}

export const useOptions = () => {
  return useYarnStore(state => state.options, shallow)
}