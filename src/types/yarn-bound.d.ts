

declare module 'yarn-bound' {

  type HasToString = { 'toString': () => string }
  type Primitive = number | string | boolean

  export type ResultMetaData = {
    title: string,
    fileTags: string[],
    // @TODO figure out how to allow generic keys here
    // anyKey: string
  }

  type Markup = {
    name: string,
    properties: Record<string, string>
  }

  class BaseResult {
    hashtags: string[]
    markup: Markup[]
    isDialogueEnd?: true
  }

  export class CommandResult extends BaseResult {
    metadata: ResultMetaData
    command: string
  }

  export class TextResult extends BaseResult {
    metadata: ResultMetaData
    text: string
  }

  export class OptionResult extends BaseResult {
    text: string
    metadata?: ResultMetaData;
    isAvailable: boolean
  }

  export class OptionsResult extends BaseResult {
    text?: string
    options: OptionResult[]
  }

  export type YarnFunction = <T extends HasToString>(...args: any[]) => T | Primitive | void

  export type CurrentResult = TextResult | CommandResult | OptionsResult | undefined

  export type YarnStorage = {
    get: (key: string) => Primitive,
    set: (key: string, val: Primitive) => void
  }

  export default class YarnBound {

    public currentResult: CurrentResult

    constructor(options: {
      dialogue: string,
      startAt?: string,
      combineTextAndOptionsResults?: boolean,
      handleCommand?: (command: CommandResult) => void,
      functions?: { [functionName: string]: YarnFunction }
      variableStorage?: YarnStorage
    })

    advance(step?: number): void

    registerFunction(key: string, func: YarnFunction): void

  }
  
}
