import { useCallback, useRef, useState } from "react"
import YarnBound from 'yarn-bound'
import { useNode, useYarnStorage } from './useYarnStore';
import { getCharacter } from '../utils';
import useCommandHandler from "./useCommandHandler";
import { useYarnStore } from "../store";


export type Character = {
  name: string
  states: readonly string[],
  color: {
    light: string,
    dark: string
  } 
}

export type YarnHookOptions = {
  skippable: boolean,
  defaultToFirstOption: boolean
}

// https://docs.yarnspinner.dev/getting-started/writing-in-yarn/functions
const yarnFunctions = {
  visited: (nodeName: string) => {
    return useYarnStore.getState().nodeVisitsMap[nodeName] > 0
  },
  visited_count: (nodeName: string) => {
    return useYarnStore.getState().nodeVisitsMap[nodeName] || 0
  },
  random: Math.random,
  random_range: (low: number, high: number) => {
    const min = Math.ceil(low);
    const max = Math.floor(high);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  dice: (high = 6) => {
    const max = Math.floor(high)
    return Math.floor(Math.random()*max) + 1
  },
  round: Math.round,
  round_places: (num: number, places: number) => {
    const multiplier = 10^places;
    return Math.round(num * multiplier) / multiplier;
  },
  floor: Math.floor,
  ceil: Math.ceil,
  inc: (num: number) => {
    const c = Math.ceil(num)
    return c === num ? num + 1 : num
  },
  dec: (num: number) => {
    const f = Math.floor(num)
    return f === num ? num - 1 : num
  },
  decimal: (num: number) => {
    return num - Math.floor(num)
  },
  int: (num: number) => {
    const f = Math.floor(num)
    return Math.max(0, f)
  }
}

const defaultOptions: YarnHookOptions = {
  skippable: false,
  defaultToFirstOption: true
}

const useYarn = (text: string, _options: Partial<YarnHookOptions> = defaultOptions) => {
  const { skippable } = { ...defaultOptions, ..._options }

  const setKey = useState(0)[1]
  const isAllowedToAdvance = useRef(false)

  const [node, setNode] = useNode()

  const storage = useYarnStorage()
  const handleCommand = useCommandHandler()

  const getRunner = (startNode: string) => {
    return new YarnBound({
      startAt: startNode,
      dialogue: text,
      combineTextAndOptionsResults: true,
      variableStorage: storage,
      functions: yarnFunctions,
      handleCommand: handleCommand
    })
  }

  const gameRef = useRef(getRunner(node))

  const advance = useCallback((step?: number) => {
    console.log('advance')
    const runner = gameRef.current
    if(step !== undefined) {
      // coming from a manual handler (option select probably)
      isAllowedToAdvance.current = true
    }
    if(!isAllowedToAdvance.current && !skippable) {
        return
    }
    isAllowedToAdvance.current = false
    runner.advance(step)
    if(runner.currentResult && 'metadata' in runner.currentResult && runner.currentResult.metadata?.title) {
      setNode(runner.currentResult?.metadata?.title)
    }
    setKey(k => k+1)
  }, [setKey, skippable, setNode])

  const setAllowedToAdvance = useCallback((allowed = true) => {
    isAllowedToAdvance.current = allowed
  }, [])

  const currentResult = gameRef.current.currentResult
  const character = getCharacter(currentResult)

  return {
    currentResult,
    setAllowedToAdvance,
    advance,
    character
  }
}

export default useYarn