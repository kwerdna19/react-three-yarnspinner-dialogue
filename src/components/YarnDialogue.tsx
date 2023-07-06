import { Vector2, useThree } from "@react-three/fiber"
import { getCharacter, getValueFromVariableInput, vector2ToTuple } from "../utils"
import { ComponentProps, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import useCommandHandler from "../hooks/useCommandHandler"
import YarnBound, { CurrentResult, YarnStorage } from "yarn-bound"
import TeleprompterText, { TeleprompterTextProps } from "./TeleprompterText"
import { Hud, OrthographicCamera, RoundedBox, Text } from "@react-three/drei"
import { Group, Mesh } from "three"
import OptionsPicker from "./OptionsPicker"
import useForceUpdate from "../hooks/useForceUpdate"
import { yarnFunctions } from "./yarn-functions"
import { useYarnStore } from "../store"
import MoreIndicator from "./MoreIndicator"

type RoundedBoxProps = ComponentProps<typeof RoundedBox>

export type CharacterLabelAttributes = {
  x?: number,
  y?: number,
  bg?: string,
  width?: number | string,
  height?: number | string,
  opacity?: number,
  labelColor?: string,
  labelSize?: number
} & Pick<RoundedBoxProps, 'radius'>

export type CharacterLabelInput = {
  character: string | undefined | null,
  dialogueBoxWidth: number,
  dialogueBoxHeight: number,
  characterBoxWidth: number,
  characterBoxHeight: number
}

export type YarnDialogueProps = {
  yarn: string,
  renderPriority?: number,
  advanceOnClick?: boolean,
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
  defaultCharacterLabelAttributes?: Partial<CharacterLabelAttributes> 
  getCharacterLabelAttributes?: (input: CharacterLabelInput) => CharacterLabelAttributes | undefined
}

export type YarnDialogue = {
  advance: (step?: number) => void,
  setSelectedOption: (step?: number | null | undefined) => void
  selectedOption: number | null,
  current: CurrentResult | null
  character: string | null
}

export const YarnDialogue = forwardRef<YarnDialogue, YarnDialogueProps>(({
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
  startNode,
  commands,
  bottom, top, left, right,
  getCharacterLabelAttributes,
  defaultCharacterLabelAttributes,
  advanceOnClick = false,
  renderPriority,
}: YarnDialogueProps, ref) => {

  const [printingDone, setPrintingDone] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const defaultSelected = defaultToFirstOption ? 0 : null
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<null | number>(defaultSelected)


  const gameRef = useRef<YarnBound | null>(null)
  const textRef = useRef<Mesh>(null)
  const optionsRef = useRef<Group>(null)


  const { size: { width: canvasWidth, height: canvasHeight } } = useThree()
  const width = getValueFromVariableInput(inputWidth, canvasWidth)
  const height = getValueFromVariableInput(inputHeight, canvasHeight)


  const update = useForceUpdate()
  const setNode = useYarnStore(state => state.setNode)

  const handleCommand = useCommandHandler(commands)

  useEffect(() => {
    // console.log("INIT YARNBOUND")
    gameRef.current = new YarnBound({
      startAt: startNode ?? useYarnStore.getState().node,
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

  useEffect(() => {
    if(!printingDone) {
      return
    }
    const t = setTimeout(() => {
      setShowOptions(true)
    }, 1000/textSpeed)
    return () => clearTimeout(t)
  }, [printingDone, setShowOptions, textSpeed])

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
    // console.log('--- advance!')
    runner.advance(step)
    if(runner.currentResult && 'metadata' in runner.currentResult && runner.currentResult.metadata?.title) {
      setNode(runner.currentResult?.metadata?.title)
    }
    setPrintingDone(false)
    setShowOptions(false)
    update()
  }, [setNode, printingDone, skippable, setPrintingDone, setShowOptions, update])

  const current = gameRef.current?.currentResult
  const character = getCharacter(current)

  useImperativeHandle(ref, () => {
    return {
      advance,
      setSelectedOption: (index?: number | null | undefined) => {
        setSelectedOptionIndex(typeof index === 'number' ? index : null)
      },
      selectedOption: selectedOptionIndex,
      current: gameRef.current?.currentResult ?? null,
      character: character ?? null
    }
  }, [advance, setSelectedOptionIndex, selectedOptionIndex, character]);

  const [posX, posY] = vector2ToTuple(position)
  const [transformX, transformY] = transform ?? [null, null]

  const { x, y } = useMemo(() => {

      let x = posX
      let y = posY

      const xTransform = (transformX ? -1*getValueFromVariableInput(transformX, width) : 0)
      const yTransform = (transformY ? getValueFromVariableInput(transformY, height) : 0)
  
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

  }, [left, right, top, bottom, posX, posY, canvasHeight, canvasWidth, height, width, transformX, transformY])

  if(current?.isDialogueEnd) {
    return null
  }

  const hasOptions = current && 'options' in current

  const hasText =  current && 'text' in current
  const text = hasText ? current.text : undefined

  const optionsY = (textRef.current?.geometry?.boundingBox?.min?.y || 0) - (lineHeight*fontSize*0.5)

  const defaultCharBoxWidth = defaultCharacterLabelAttributes?.width ? getValueFromVariableInput(defaultCharacterLabelAttributes.width, width) : (width / 3.5)
  const defaultCharBoxHeight = defaultCharacterLabelAttributes?.height ?  getValueFromVariableInput(defaultCharacterLabelAttributes.height, height) : (fontSize*2.25)

  const baseCharBoxOptions = getCharacterLabelAttributes ? getCharacterLabelAttributes({
    dialogueBoxHeight: height,
    dialogueBoxWidth: width,
    characterBoxHeight: defaultCharBoxHeight,
    characterBoxWidth: defaultCharBoxWidth,
    character: character,
  }) : defaultCharacterLabelAttributes

  const charBoxOptions = {
    width: defaultCharBoxWidth,
    height: defaultCharBoxHeight,
    x: 0,
    y: 0,
    ...defaultCharacterLabelAttributes,
    ...baseCharBoxOptions,
  }

  const charBoxWidth = typeof charBoxOptions.width === 'string' ? getValueFromVariableInput(charBoxOptions.width, width) : defaultCharBoxWidth
  const charBoxHeight = typeof charBoxOptions.height === 'string' ? getValueFromVariableInput(charBoxOptions.height, height) : defaultCharBoxHeight
  const charBoxX = charBoxOptions.x + charBoxWidth/2
  const charBoxY = charBoxHeight*0.5 + charBoxOptions.y

  const showMoreIndicator = printingDone && !hasOptions

  return (<Hud renderPriority={renderPriority}>
  <OrthographicCamera makeDefault position={[0,0,5]} />
  <group position={[x, y, 0]} onClick={() => {
    if(!hasOptions && advanceOnClick) {
      advance()
    }
  }}>
      {character ? <RoundedBox
        radius={charBoxOptions.radius ?? charBoxHeight/2}
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
    {showMoreIndicator && <MoreIndicator color={fontColor} position={[width/2, -height]} />}
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
        ref={textRef}
        line={text}
        printingDone={printingDone}
        setPrintingDone={setPrintingDone}
        fontSize={fontSize}
        lineHeight={lineHeight}
        mode={textMode}
        speed={textSpeed}
        color={fontColor}
        maxWidth={width - 2*padding}
        maxHeight={height - 2*padding}
      />
      {(showOptions && hasOptions) ? <OptionsPicker
          ref={optionsRef}
          options={current.options}
          onSelection={advance}
          speed={textSpeed}
          fontSize={fontSize}
          lineHeight={optionsLineHeight ?? lineHeight}
          fontColor={optionsFontColor ?? fontColor}
          position={[0, optionsY]}
          selectedIndex={selectedOptionIndex}
          setSelectedIndex={setSelectedOptionIndex}
      /> : null}
    </group>
  </RoundedBox>  
  </group>
  </Hud>)


});