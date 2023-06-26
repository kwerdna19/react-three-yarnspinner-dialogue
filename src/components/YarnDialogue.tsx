import { GroupProps, Vector2 } from "@react-three/fiber"
// import useTrigger from "../hooks/useTrigger"
import { vector2ToTuple } from "../utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { useYarnStore } from "../store"
import { useNode, useYarnStorage } from "../hooks/useYarnStore"
import useCommandHandler from "../hooks/useCommandHandler"
import YarnBound from "yarn-bound"
import TeleprompterText, { TeleprompterTextProps } from "./TeleprompterText"
import { RoundedBox } from "@react-three/drei"
import { Mesh } from "three"
import OptionsPicker from "./OptionsPicker"
import useForceUpdate from "../hooks/useForceUpdate"
import useTrigger from "../hooks/useTrigger"

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


type BaseYarnDialogueProps = {
  yarn: string,
  width: number,
  height: number
  position?: Vector2
  padding?: number,
  textMode?: TeleprompterTextProps['mode']
  textSpeed?: TeleprompterTextProps['speed'],
  backgroundColor?: string,
  fontSize?: number,
  lineHeight?: number,
  opacity?: number,
  borderRadius?: number,
  fontColor?: string
  optionsFontColor?: string,
  skippable?: boolean,
  defaultToFirstOption?: boolean,
}

export type YarnDialogProps = BaseYarnDialogueProps & Omit<GroupProps, keyof BaseYarnDialogueProps>

export default function YarnDialogue({
  yarn,
  width,
  height,
  skippable = false,
  defaultToFirstOption = false,
  position = [0, 0],
  opacity = 1,
  fontColor = 'black',
  fontSize = 16,
  padding = 0,
  borderRadius = 0,
  textMode = 'letter',
  textSpeed = 6,
  lineHeight = 1,
  optionsFontColor,
  backgroundColor,
  ...rest
}: YarnDialogProps) {

  const textRef = useRef<Mesh>(null)
  const [printingDone, setPrintingDone] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const update = useForceUpdate()

  const [node, setNode] = useNode()
  const storage = useYarnStorage()
  const handleCommand = useCommandHandler()

  const gameRef = useRef(new YarnBound({
    startAt: 'Start',
    dialogue: yarn,
    combineTextAndOptionsResults: true,
    variableStorage: storage,
    functions: yarnFunctions,
    handleCommand: handleCommand
  }))

  const advance = useCallback((step?: number) => {
    if(!printingDone) {
      if(skippable) {
        setPrintingDone(true)
      }
      return
    }
    const runner = gameRef.current
    console.log('--- advance', step)
    if(runner.currentResult && 'options' in runner.currentResult && step === undefined) {
      console.log('skipping because no step passed in')
      return 
    }
    // if(step !== undefined) {
    //   // coming from a manual handler (option select probably)
    //   isAllowedToAdvance.current = true
    // }
    // if(!isAllowedToAdvance.current && !skippable) {
    //     return
    // }
    // isAllowedToAdvance.current = false
    runner.advance(step)
    if(runner.currentResult && 'metadata' in runner.currentResult && runner.currentResult.metadata?.title) {
      setNode(runner.currentResult?.metadata?.title)
    }
    update()
  }, [update, setNode, printingDone, skippable])


  const current = gameRef.current.currentResult
  // const character = getCharacter(currentResult)

  const [x, y] = vector2ToTuple(position)



  const hasOptions = current && 'options' in current

  const hasText =  current && 'text' in current
  const text = hasText ? current.text ?? '' : ''

  useEffect(() => {
    if(!printingDone) {
      return
    }
    const t = setTimeout(() => {
      setShowOptions(true)
    }, 1000/textSpeed)
    return () => clearTimeout(t)
  }, [printingDone, setShowOptions, textSpeed])

  useTrigger(advance)


  useEffect(() => {
    setPrintingDone(false)
    setShowOptions(false)
  }, [text])

  const optionsY = (textRef.current?.geometry?.boundingBox?.min?.y || 0)

  return <group position={[x, y, 0]} {...rest}>
    <RoundedBox radius={borderRadius} args={[width, height, 0]} position={[width/2, -height/2 ,0]} material-color={backgroundColor} material-opacity={opacity} material-transparent>
  <group position={[-width/2 + padding, height/2 - padding, 0]} >
    <TeleprompterText
      line={text}
      printingDone={printingDone}
      setPrintingDone={setPrintingDone}
      fontSize={fontSize}
      lineHeight={lineHeight}
      ref={textRef}
      mode={textMode}
      speed={textSpeed}
      color={fontColor}
      maxWidth={width - 2*padding}
      maxHeight={height - 2*padding}
      skippable={skippable}
    />
    {showOptions && hasOptions && <OptionsPicker
        options={current.options}
        onSelection={advance}
        speed={textSpeed}
        fontSize={fontSize}
        fontColor={optionsFontColor ?? fontColor}
        position={[0, optionsY, 1]}

        defaultToFirstOption={defaultToFirstOption}
    />}
  </group>
</RoundedBox>

    {/* <DialogueBox
      advance={advance}
      current={currentResult}
      width={width}
      height={height}
      defaultToFirstOption={defaultToFirstOption}
      skippable={skippable}

      // move up ---
      textMode="word"
      fontSize={16}
      lineHeight={1.3}
      textSpeed={4}
      padding={5}
    /> */}
  
  </group>
}