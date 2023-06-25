import { CurrentResult } from 'yarn-bound'
import OptionsPicker from "./OptionsPicker"
import TeleprompterText, { TeleprompterTextProps } from './TeleprompterText';
import useYarn from "../hooks/useYarn"
import { RoundedBox } from '@react-three/drei'
import { useState, useEffect, useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber'
import { Box3, Mesh, OrthographicCamera, Vector3 } from 'three'
import useTrigger from '../hooks/useTrigger';


type DialogueBoxProps = {
  current: CurrentResult,
  advance: ReturnType<typeof useYarn>['advance'],
  setAllowedToAdvance: ReturnType<typeof useYarn>['setAllowedToAdvance'],
  width: number,
  height: number,
  position?: [number, number],
  padding?: number,
  expandDirection?: 'up' | 'down',
  textMode?: TeleprompterTextProps['mode']
  textSpeed?: TeleprompterTextProps['speed'],
  backgroundColor?: string,
  fontSize?: number,
  lineHeight?: number,
  opacity?: number,
  borderRadius?: number,
  fontColor?: string
  optionsFontColor?: string
}

// styles for narration only (no character?)

// const defaultCharacterBoxOptions = {
//   height: 40,
//   width: 105,
//   color: 'black',
//   placement: 0,
//   fontSize: 16,
//   opacity: 0.66,
//   backgroundColor: '#e0e0e0',
//   x: 0,
//   y: 0,
//   borderRadius: 0,
//   marginBottom: 8,
// }

// const defaultDialogBoxOptions = {
//   backgroundColor: '#42c5f5',
//   fontSize: 16,
//   lineHeight: 1.25,
//   opacity: 0.6,
//   borderRadius: 0,
//   color: 'black',
// }


const DialogueBox = ({
  current,
  advance,
  setAllowedToAdvance,
  textMode = 'letter',
  textSpeed = 6,
  width,
  height,
  position = [0,0],
  padding = 0,
  expandDirection = 'up',
  backgroundColor,
  lineHeight,
  opacity,
  borderRadius,
  fontSize = 16,
  fontColor = 'black',
  optionsFontColor,
}: DialogueBoxProps) => {

  const camera = useThree(s => s.camera)
  if(!(camera instanceof OrthographicCamera)) {
    throw new Error('Dialog component only works with THREE.js OrthographicCamera')
  }

  const ref = useRef<Mesh>(null)

  const textRef = useRef<Mesh>(null)

  const [printingDone, setPrintingDone] = useState(false)
  const [textHeight, setTextHeight] = useState(0)
  const [optionsHeight, setOptionsHeight] = useState(0)


  const text = current && 'text' in current ? current.text ?? '' : ''
  const showOptions = current && 'options' in current && printingDone
  const allowed = !(current && 'options' in current)

  const moveOn = useCallback(() => {
    console.log('move', { textHeight, height })
    if(textHeight > height) {
      // stuff
      return
    }
    advance()
  }, [advance, textHeight, height])

  useTrigger(moveOn)

  const onPrintEnd = useCallback(() => {
    setAllowedToAdvance(allowed)
    setTimeout(() => setPrintingDone(true), 1000/textSpeed)
  }, [setPrintingDone, setAllowedToAdvance, textSpeed, allowed])

  useEffect(() => {
    setPrintingDone(false)
  }, [text, setPrintingDone])

  useEffect(() => {

    if(!textRef.current) {
      return
    }
    function onComplete() {
      if(textRef.current) {
        const h = new Box3().setFromObject(textRef.current).getSize(new Vector3()).y
        setTextHeight(h)
      }
    }
    textRef.current.addEventListener('synccomplete', onComplete)
    return () => textRef.current?.removeEventListener('synccomplete', onComplete)
  }, [])

  if(!text) {
    return null
  }


  const getTextHeight = () => {
    const textYMin = textRef.current?.geometry?.boundingBox?.min?.y
    const textYMax = textRef.current?.geometry?.boundingBox?.max?.y
    if(textYMin === undefined || textYMax=== undefined) {
      return 0
    }
    return textYMax-textYMin
  }

  const optionsY = (textRef.current?.geometry?.boundingBox?.min?.y || 0)
  // const actualHeight = optionsHeight - optionsY + (padding*2)

  // const boxHeight = Math.max(actualHeight, minHeight) // Max between this and actual Height

  // const yActualHeightAdjustment = expandDirection === 'up' && actualHeight > minHeight ? actualHeight - minHeight : 0
  // const y2 = position[1] + yActualHeightAdjustment

  // const halfHeight = canvasHeight/2
  // const yOutOfBottomFrameAdjustment = y2 - boxHeight < -halfHeight ? (Math.abs(y2 - boxHeight) - halfHeight) : 0
  // const yOutOfTopFrameAdjustment = y2 > halfHeight ? -(y2 - halfHeight) : 0

  // const y = y2 + yOutOfBottomFrameAdjustment + yOutOfTopFrameAdjustment

  // const showIndicator = printingDone && current instanceof TextResult && !current.isDialogueEnd

  // const characterIndex = characters.findIndex(c => c.name === character)
  // const characterObject = characters[characterIndex]
  
  // const colors = characterObject?.color || {
  //   light: characterBoxOptions.backgroundColor,
  //   dark: characterBoxOptions.color,
  // }

  // const placement = characterIndex > -1 ? characterIndex/characters.length : (characterBoxOptions.placement || 0)

  return (<RoundedBox ref={ref} radius={borderRadius} args={[width, height, 0]} position={[width/2, -height/2 ,0]} material-color={backgroundColor} material-opacity={opacity} material-transparent>
  <group position={[-width/2 + padding, height/2 - padding, 0]} >
    <TeleprompterText
      line={text}
      onPrintEnd={onPrintEnd}
      fontSize={fontSize}
      lineHeight={lineHeight}
      maxWidth={width - 2*padding}
      ref={textRef}
      mode={textMode}
      speed={textSpeed}
      color={fontColor}
      maxHeight={height - 2*padding}
    />
    {showOptions && <OptionsPicker
        options={current.options}
        onSelection={advance}
        speed={textSpeed}
        fontSize={fontSize}
        fontColor={optionsFontColor ?? fontColor}
        position={[0, optionsY, 1]}
        onHeightMeasure={setOptionsHeight}
    />}
  </group>
</RoundedBox>)

}

export default DialogueBox