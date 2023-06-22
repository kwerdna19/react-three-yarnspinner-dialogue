import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type Primitive = number | string | boolean

export type TextMode = 'letter' | 'word' | 'instant'
export interface YarnStore {
  node: string,
  prevNode: string
  setNode: (newNode: string) => void
  nodeVisitsMap: Record<string, number>
  options: {
    skippable: boolean,
    defaultSelectFirstOptions: boolean,
    textMode: TextMode,
    textSpeed: number
  }
  storage: {
    [key: string]: Primitive
  }
  set: (key: string, value: Primitive) => void
  get: (key: string) => Primitive,
  has: (key: string) => boolean
}

const defaultStartingNode = 'Start'

export const useYarnStore = create<YarnStore>()(
  devtools(
    (set, get) => ({
      node: defaultStartingNode,
      prevNode: defaultStartingNode,
      nodeVisitsMap: {
        [defaultStartingNode]: 1
      },
      options: {
        defaultSelectFirstOptions: false,
        skippable: false,
        textSpeed: 5,
        textMode: 'letter'
      },
      storage: {},
      set: (key, value) => set((state) => ({ storage: {...state.storage, [key]: value} })),
      get: (key) => get().storage[key],
      has: (key) => key in get().storage,
      setNode: (node) => {
        if(get().node === node) {
          return
        }
        set((state) => ({
          node: node,
          prevNode: state.node,
          nodeVisitsMap: {
            ...state.nodeVisitsMap,
            [state.node]: (state.nodeVisitsMap[state.node] || 0) + 1
          }
        }))
      }
    })
  )
)