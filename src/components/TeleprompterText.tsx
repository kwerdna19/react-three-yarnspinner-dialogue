import { Text } from "@react-three/drei"
import { Vector3 } from "@react-three/fiber"
import { forwardRef, useCallback, useEffect, useState } from "react"
import { Mesh } from "three"
import useTrigger from "../hooks/useTrigger"

// range from 1-10 (technically > 0 && <= 500)
// 0.1 = 5 sec / word --> 500 = 1 ms / word

type Props = {
  line: string,
  speed?: number,
  onPrintEnd?: (returnedEarly?: boolean) => void,
  mode?: 'word' | 'letter' | 'instant',

  color?: string,
  fontSize?: number,
  lineHeight?: number,
  position?: Vector3,
  maxWidth?: number
}

const TeleprompterText = forwardRef<Mesh, Props>(({
  line,
  speed = 6,
  fontSize = 12,
  lineHeight = 1.1,
  onPrintEnd,
  color = 'black',
  position,
  maxWidth,
  mode = 'word',
}: Props, ref) => {

    const elements = mode === 'instant' ? [line] : line.split(mode === 'word' ? ' ' : '')
    const totalElements = elements.length

    const wordDur = 500/speed // in ms
    const letterDur = wordDur/8

    const elementDur = mode === 'word' ? wordDur : (mode === 'letter' ? letterDur : 0)

    const [elementNum, setElementNum] = useState(0)

    const onTrigger = useCallback(() => {
      setElementNum(totalElements)
    }, [setElementNum, totalElements])
  
    useTrigger(onTrigger)
  
    useEffect(() => {
      setElementNum(0)
    }, [line, setElementNum])

    useEffect(() => {
      if(elementNum >= totalElements) {
        onPrintEnd?.()
        return
      }
      const t = setTimeout(() => {
        setElementNum(e => e + 1)
      }, elementDur)
      return () => clearTimeout(t)
    }, [elementDur, elementNum, totalElements, setElementNum, onPrintEnd])
  
    const text = elements.slice(0, elementNum).join(mode === 'word' ? ' ' : '')
  
    return (<Text
      ref={ref}
      color={color}
      fontSize={fontSize}
      position={position}
      anchorX="left"
      anchorY="top"
      maxWidth={maxWidth}
      lineHeight={lineHeight}
  >
    {text}
  </Text>)
  


})

export default TeleprompterText