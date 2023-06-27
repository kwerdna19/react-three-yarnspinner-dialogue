import { Vector2, useThree } from "@react-three/fiber"
import { getCharacter, getValueFromVariableInput, vector2ToTuple } from "../utils"
import { ComponentProps, useCallback, useEffect, useRef, useState } from "react"
import { useNode } from "../hooks/useYarnStore"
import useCommandHandler from "../hooks/useCommandHandler"
import YarnBound, { YarnStorage } from "yarn-bound"
import TeleprompterText, { TeleprompterTextProps } from "./TeleprompterText"
import { Hud, OrthographicCamera, RoundedBox, Text } from "@react-three/drei"
import { Mesh } from "three"
import OptionsPicker from "./OptionsPicker"
import useForceUpdate from "../hooks/useForceUpdate"
import useTrigger from "../hooks/useTrigger"
import { yarnFunctions } from "./yarn-functions"

type RoundedBoxProps = ComponentProps<typeof RoundedBox>

export type CharacterLabelAttributes = {
  x?: number,
  y?: number,
  bg?: string,
  width?: number,
  height?: number,
  opacity?: number,
  labelColor?: string,
  labelSize?: number
} & Pick<RoundedBoxProps, 'radius'>

export type YarnDialogProps = {
  yarn: string,
  width: number | string,
  height: number | string
  position?: Vector2
  transform?: [number | string, number | string]
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
  optionsLineHeight?: number
  skippable?: boolean,
  defaultToFirstOption?: boolean,
  storage?: YarnStorage,
  startNode?: string,
  commands?: Parameters<typeof useCommandHandler>[0],
  bottom?: number | string,
  top?: number | string,
  left?: number | string,
  right?: number | string,
  getCharacterLabelAttributes?: (input: {
    character: string | undefined | null,
    boxWidth: number,
    boxHeight: number
  }) => CharacterLabelAttributes | undefined
}

export default function YarnDialogue({
  yarn,
  width: inputWidth,
  height: inputHeight,
  skippable = false,
  defaultToFirstOption = false,
  position = [0, 0],
  transform,
  opacity = 1,
  fontColor = 'black',
  fontSize = 16,
  padding = 0,
  borderRadius = 0,
  textMode = 'letter',
  textSpeed = 6,
  lineHeight = 1.25,
  optionsLineHeight,
  optionsFontColor,
  backgroundColor = 'lightgray',
  storage,
  startNode = 'Start',
  commands,
  bottom, top, left, right,
  getCharacterLabelAttributes = () => undefined
}: YarnDialogProps) {

  const { size: { width: canvasWidth, height: canvasHeight } } = useThree()

  const width = getValueFromVariableInput(inputWidth, canvasWidth)
  const height = getValueFromVariableInput(inputHeight, canvasHeight)

  const textRef = useRef<Mesh>(null)
  const [printingDone, setPrintingDone] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const update = useForceUpdate()

  const [,setNode] = useNode()

  const handleCommand = useCommandHandler(commands)

  const gameRef = useRef<YarnBound | null>(null)

  useEffect(() => {
    console.log("INIT YARNBOUND")
    gameRef.current = new YarnBound({
      startAt: startNode,
      dialogue: yarn,
      combineTextAndOptionsResults: true,
      variableStorage: storage,
      functions: yarnFunctions,
      handleCommand
    })
    setPrintingDone(false)
    setShowOptions(false)
    update()
  }, [yarn, storage, handleCommand, update, startNode, setPrintingDone, setShowOptions])

  const advance = useCallback((step?: number) => {
    const runner = gameRef.current
    if(!runner) {
      return
    }
    if(!printingDone) {
      if(skippable && !runner.currentResult?.isDialogueEnd) {
        setPrintingDone(true)
      }
      return
    }
    if(runner.currentResult && 'options' in runner.currentResult && step === undefined) {
      return 
    }
    console.log('--- advance!')
    runner.advance(step)
    if(runner.currentResult && 'metadata' in runner.currentResult && runner.currentResult.metadata?.title) {
      setNode(runner.currentResult?.metadata?.title)
    }
    setPrintingDone(false)
    setShowOptions(false)
  }, [setNode, printingDone, skippable, setPrintingDone, setShowOptions])


  const getPosition = () => {

    let [x, y] = vector2ToTuple(position)
    const xTransform = (transform ? -1*getValueFromVariableInput(transform[0], width) : 0)
    const yTransform = (transform ? getValueFromVariableInput(transform[1], height) : 0)

    if(bottom !== undefined) {
      y = -canvasHeight/2 + height + getValueFromVariableInput(bottom, canvasHeight) - yTransform
    } else if (top !== undefined) {
      y = canvasHeight/2 - getValueFromVariableInput(top, canvasHeight) + yTransform
    } else {
      y += yTransform
    }

    if(left !== undefined) {
      x = -canvasWidth/2 + getValueFromVariableInput(left, canvasWidth) + xTransform
    } else if (right !== undefined) {
      x = canvasWidth/2 - width - getValueFromVariableInput(right, canvasWidth) + xTransform
    } else {
      x += xTransform
    }

    return { x, y }
  }

  const { x, y } = getPosition()

  const current = gameRef.current?.currentResult
  const hasOptions = current && 'options' in current

  const hasText =  current && 'text' in current
  const text = hasText ? current.text : undefined

  const character = getCharacter(current)


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

  const optionsY = (textRef.current?.geometry?.boundingBox?.min?.y || 0) - (lineHeight*fontSize*0.5)


  if(current?.isDialogueEnd) {
    return null
  }

  const charBoxOptions = getCharacterLabelAttributes({
    boxHeight: height,
    boxWidth: width,
    character: character
  }) ?? {}

  const charBoxWidth = charBoxOptions.width ?? (width / 3.5)
  const charBoxHeight = charBoxOptions.height ?? (fontSize*2.25)
  const charBoxX = (charBoxOptions.x ?? 0) + charBoxWidth/2
  const charBoxY = charBoxOptions.y !== undefined ? (charBoxHeight*0.5 + charBoxOptions.y) : (charBoxHeight*0.5 + fontSize/2)
  return <Hud>
  <OrthographicCamera makeDefault position={[0,0,5]} />
  <group position={[x, y, 0]}>
      {character ? <RoundedBox
        radius={charBoxHeight/2}
        args={[charBoxWidth, charBoxHeight, 1]}
        position={[charBoxX, charBoxY, 1]}
        material-color={charBoxOptions.bg ?? backgroundColor}
        material-opacity={charBoxOptions.opacity ?? opacity}
        material-transparent
      >
      <Text
        fontSize={charBoxOptions.labelSize ?? fontSize}
        lineHeight={1}
        color={charBoxOptions.labelColor ?? fontColor}
        position={[0,0,1]}
      >
        {character}
      </Text>
    </RoundedBox> : null}
    <RoundedBox
      radius={borderRadius}
      args={[width, height, 1]}
      position={[width/2, -height/2 ,0]}
      material-color={backgroundColor}
      material-opacity={opacity}
      material-transparent
    >
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
      />
      {showOptions && hasOptions && <OptionsPicker
          options={current.options}
          onSelection={advance}
          speed={textSpeed}
          fontSize={fontSize}
          lineHeight={optionsLineHeight ?? lineHeight}
          fontColor={optionsFontColor ?? fontColor}
          position={[0, optionsY]}
          defaultToFirstOption={defaultToFirstOption}
      />}
    </group>
  </RoundedBox>  
  </group>
  </Hud>
}