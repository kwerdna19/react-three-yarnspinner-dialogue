import { CommandResult } from 'yarn-bound';
// import { useThree } from "@react-three/fiber";

export const yarnCommands = [
  'log',
  'alert'
] as const

type Cmd = typeof yarnCommands[number]

type CommandMap = Record<Cmd, (...args: unknown[]) => void>

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
  // handle default case?
  return a
}

const useCommandHandler = () => {
  // const t = useThree()


  // @TODO configure some nice THREE scene commands
  // figure out attaching to a ref? updating with useEffect as three scene changes? is that needed?
  const commandMap: CommandMap = {
    log: (...args) => {
      console.log(...args)
    },
    alert: (message) => {
      alert(message)
    }
  }

  const handler = (command: CommandResult) => {
    const [commandName, ...args] = command.command.match(/\w+|"(?:\\"|[^"])+"/g) || []
    const cmd = commandName as Cmd
    if(commandMap[cmd]) {
      commandMap[cmd](...args.map(parseStringArg))
    } else {
      console.error(`Attempted to use a command which is not implemented: "${cmd}"`)
    }
  }

  return handler
}
export default useCommandHandler