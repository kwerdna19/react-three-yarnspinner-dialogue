import { CurrentResult, TextResult } from 'yarn-bound'
import OptionsPicker from "./OptionsPicker"
import TeleprompterText from './TeleprompterText';
import useYarn, { Character } from "../hooks/useYarn"
import { getCharacter, mapOverRange } from '../utils'
import { RoundedBox, Text } from '@react-three/drei'
import { useState, useEffect, useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber'
import { Mesh, OrthographicCamera } from 'three'
import NextDialogIndicator from './NextDialogIndicator'


type DialogueBoxProps = {
  current: CurrentResult,
  advance: ReturnType<typeof useYarn>['advance'],
  setAllowedToAdvance: ReturnType<typeof useYarn>['setAllowedToAdvance'],
  width?: number,
  minHeight?: number,
  position?: [number, number],
  padding?: number,
  expandDirection?: 'up' | 'down',
  textMode: Parameters<typeof TeleprompterText>[0]['mode']
  textSpeed?: number,
  characters?: Character[],
  characterBoxOptions?: Partial<{
    height: number,
    width: number,
    color: string,
    placement: number,
    fontSize: number,
    opacity: number,
    backgroundColor: string,
    x: number,
    y: number,
    borderRadius: number,
    marginBottom: number,
  }>,
  dialogBoxOptions?: Partial<{
    backgroundColor: string,
    fontSize: number,
    lineHeight: number,
    opacity: number,
    borderRadius: number,
    color: string
  }>,
  indicatorColor?: string,
  indicatorSize?: number
}

// styles for narration only (no character?)

const defaultCharacterBoxOptions = {
  height: 40,
  width: 105,
  color: 'black',
  placement: 0,
  fontSize: 16,
  opacity: 0.66,
  backgroundColor: '#e0e0e0',
  x: 0,
  y: 0,
  borderRadius: 0,
  marginBottom: 8,
}

const defaultDialogBoxOptions = {
  backgroundColor: '#42c5f5',
  fontSize: 16,
  lineHeight: 1.25,
  opacity: 0.6,
  borderRadius: 0,
  color: 'black',
}


const DialogueBox = ({
  current,
  advance,
  setAllowedToAdvance,
  textMode = 'letter',
  textSpeed = 6,
  width: _width,
  minHeight = 0,
  position = [0,0],
  padding = 0,
  expandDirection = 'up',
  characters = [],
  characterBoxOptions: _characterBoxOptions,
  dialogBoxOptions: _dialogBoxOptions,
  indicatorColor,
  indicatorSize
}: DialogueBoxProps) => {

  const camera = useThree(s => s.camera)
  if(!(camera instanceof OrthographicCamera)) {
    throw new Error('Dialog component only works with THREE.js OrthographicCamera')
  }

  const textRef = useRef<Mesh>(null)

  const [printingDone, setPrintingDone] = useState(false)
  const [optionsHeight, setOptionsHeight] = useState(0)

  const canvasWidth = useThree(s => s.size.width)
  const canvasHeight = useThree(s => s.size.height)


  const characterBoxOptions = {...defaultCharacterBoxOptions, ..._characterBoxOptions}
  const dialogBoxOptions = {...defaultDialogBoxOptions, ..._dialogBoxOptions}

  const width = _width ?? canvasWidth
  const text = current && 'text' in current ? current.text ?? '' : ''
  const character = getCharacter(current)
  const hasCharacter = !!character

  const showOptions = current && 'options' in current && printingDone
  const allowed = !(current && 'options' in current)

  const onPrintEnd = useCallback(() => {
    setAllowedToAdvance(allowed)
    setTimeout(() => setPrintingDone(true), 1000/textSpeed)
  }, [setPrintingDone, setAllowedToAdvance, textSpeed, allowed])

  useEffect(() => {
    setPrintingDone(false)
  }, [text, setPrintingDone])

  if(!text) {
    return null
  }

  const optionsY = (textRef.current?.geometry?.boundingBox?.min?.y || 0) - characterBoxOptions.marginBottom
  const actualHeight = optionsHeight - optionsY + (padding*2)

  const boxHeight = Math.max(actualHeight, minHeight) // Max between this and actual Height

  const yActualHeightAdjustment = expandDirection === 'up' && actualHeight > minHeight ? actualHeight - minHeight : 0
  const y2 = position[1] + yActualHeightAdjustment

  const halfHeight = canvasHeight/2
  const yOutOfBottomFrameAdjustment = y2 - boxHeight < -halfHeight ? (Math.abs(y2 - boxHeight) - halfHeight) : 0
  const yOutOfTopFrameAdjustment = y2 > halfHeight ? -(y2 - halfHeight) : 0

  const y = y2 + yOutOfBottomFrameAdjustment + yOutOfTopFrameAdjustment

  const showIndicator = printingDone && current instanceof TextResult && !current.isDialogueEnd

  const characterIndex = characters.findIndex(c => c.name === character)
  const characterObject = characters[characterIndex]
  
  const colors = characterObject?.color || {
    light: characterBoxOptions.backgroundColor,
    dark: characterBoxOptions.color,
  }

  const placement = characterIndex > -1 ? characterIndex/characters.length : (characterBoxOptions.placement || 0)

  const characterBoxX = mapOverRange(placement, 0, 1, characterBoxOptions.width/2, width - characterBoxOptions.width/2)

  return <group position={[position[0], y, 0]}>
    {showIndicator && <NextDialogIndicator position={[width / 2, -boxHeight]} size={indicatorSize} color={indicatorColor || dialogBoxOptions.color} />}
    {hasCharacter && <RoundedBox
      radius={characterBoxOptions.borderRadius}
      material-color={colors.light} material-opacity={characterBoxOptions.opacity} material-transparent
      args={[characterBoxOptions.width, characterBoxOptions.height, 0]}
      position={[characterBoxX + characterBoxOptions.x, (characterBoxOptions.height / 2) + characterBoxOptions.y, 0]}>
      <Text color={colors.dark} fontSize={characterBoxOptions.fontSize} lineHeight={2} position={[0,0,1]} maxWidth={characterBoxOptions.width}>{character}</Text>
    </RoundedBox>}

    <RoundedBox radius={dialogBoxOptions.borderRadius} args={[width, boxHeight, 0]} position={[width/2, -boxHeight/2 ,0]} material-color={dialogBoxOptions.backgroundColor} material-opacity={dialogBoxOptions.opacity} material-transparent>
      <group position={[-width/2 + padding, boxHeight/2 - padding, 0]} >
        <TeleprompterText
          line={text}
          onPrintEnd={onPrintEnd}
          fontSize={dialogBoxOptions.fontSize}
          lineHeight={dialogBoxOptions.lineHeight}
          maxWidth={width - 2*padding}
          ref={textRef}
          mode={textMode}
          speed={textSpeed}
          color={dialogBoxOptions.color}
          position={[0,0,1]}
        />
        {showOptions && <OptionsPicker
            options={current.options}
            onSelection={advance}
            speed={textSpeed}
            fontSize={dialogBoxOptions.fontSize}
            position={[0, optionsY, 1]}
            onHeightMeasure={setOptionsHeight}
        />}
      </group>
    </RoundedBox>

    
      

  </group>
}

export default DialogueBox