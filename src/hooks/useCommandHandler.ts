import { CommandResult } from 'yarn-bound';
import { useCallback, useMemo } from 'react';
import { useThree } from '@react-three/fiber';

type CommandMap = Record<string, (...args: unknown[]) => void>

const parseStringArg = (a: string) => {
  const matches = a.match(/^"(.*)"$/)
  if(matches) {
    return matches[1]
  }
  if(['true', 'false'].includes(a)) {
    return Boolean(a)
  }
  if(!isNaN(Number(a))) {
    return Number(a)
  }
  if(a === 'null') {
    return null
  }
  return a
}

// browser APIs, pure commands, etc
const baseCommandMap = {
  log: (...args) => {
    console.log(...args)
  },
  alert: (message) => {
    alert(message)
  }
} satisfies CommandMap

const useCommandHandler = (additionalCommandsMap?: CommandMap) => {

  const three = useThree()
  
  const commandMap = useMemo(() => {
    
    const baseThreeCommands = {
      printCanvasSize: () => {
        console.log(`${three.size.width}x${three.size.height}`)
      }
      // @TBA add more built in three commands
    } satisfies CommandMap
    
    return {
      ...baseCommandMap,
      ...baseThreeCommands,
      ...additionalCommandsMap,
    } as CommandMap
  }, [three, additionalCommandsMap])


  return useCallback((command: CommandResult) => {
    const [commandName, ...args] = command.command.match(/\w+|"(?:\\"|[^"])+"/g) || []

    if(commandName && commandMap[commandName]) {
      commandMap[commandName](...args.map(parseStringArg))
    } else {
      console.warn(`Attempted to use a command which is not implemented: "${commandName}"`)
    }
  }, [commandMap])

}
export default useCommandHandler