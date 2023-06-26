import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type TextMode = 'letter' | 'word' | 'instant'
export interface YarnStore {
  node: string,
  prevNode: string | null
  setNode: (newNode: string) => void
  nodeVisitsMap: Record<string, number>
}

const defaultStartingNode = 'Start'

export const useYarnStore = create<YarnStore>()(
  devtools(
    (set, get) => ({
      node: defaultStartingNode,
      prevNode: null,
      nodeVisitsMap: {
        [defaultStartingNode]: 1
      },
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