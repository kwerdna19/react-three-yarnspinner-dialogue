import { Text } from "@react-three/drei"
import { Vector2 } from "@react-three/fiber"
import { ComponentProps, forwardRef, useEffect, useRef, useState } from "react"
import { Mesh, Box3, Vector3 } from 'three';
import { vector2ToTuple } from "../utils"

// range from 1-10 (technically > 0 && <= 500)
// 0.1 = 5 sec / word --> 500 = 1 ms / word

type TextProps = ComponentProps<typeof Text>

type BaseTeleprompterTextProps = {
  line?: string | undefined,
  speed?: number,
  setPrintingDone: (done: boolean) => void,
  printingDone: boolean,
  mode?: 'word' | 'letter' | 'instant',
  position?: Vector2,
  maxHeight: number
  maxWidth: number
}

// use this blank space char as the padding character so that "s___" is considered a single word for word break logic
const blankChar = '‎'

// shortcut to not call Array.from for values 1-10
const spaces: Record<number, string> = {
  1: `${blankChar}`,
  2: `${blankChar}${blankChar}`,
  3: `${blankChar}${blankChar}${blankChar}`,
  4: `${blankChar}${blankChar}${blankChar}${blankChar}`,
  5: `${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}`,
  6: `${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}`,
  7: `${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}`,
  8: `${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}`,
  9: `${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}`,
  10: `${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}${blankChar}`
}

const getSpaces = (num: number) => {
  if(num <= 0) {
    return ''
  }
  if(num <= 10) {
    return spaces[num]
  }
  return Array.from({length: num}).map(() => blankChar).join('')
}

const getNumberOfPaddingSpaces = (text: string, charIndex: number) => {
  const nextSpaceIndex = text.indexOf(' ', charIndex)
  if(nextSpaceIndex < 0) {
    return text.length - charIndex
  }
  return nextSpaceIndex - charIndex
}

export type TeleprompterTextProps = BaseTeleprompterTextProps & Omit<TextProps, 'overflowWrap' | 'whiteSpace' | 'anchorX' | 'anchorY' | 'ref' | 'children' | keyof BaseTeleprompterTextProps>

const TeleprompterText = forwardRef<Mesh, TeleprompterTextProps>(({
  line,
  speed = 6,
  setPrintingDone,
  printingDone,
  position,
  mode = 'word',
  lineHeight = 1.25,
  fontSize = 16,
  maxHeight,
  maxWidth,
  ...textProps
}: TeleprompterTextProps, ref) => {

    const isCutoff = useRef(false)
    const lineSize = lineHeight*fontSize

    const maxLines = maxHeight !== 0 ? Math.floor(maxHeight / lineSize) : Infinity
    const trueMaxHeight = maxLines * lineSize

    const elements = line === undefined ? [] : (mode === 'instant' ? [line] : line.split(mode === 'word' ? ' ' : ''))
    const totalElements = elements.length

    const wordDur = 500/speed // in ms
    const letterDur = wordDur/5

    const elementDur = mode === 'word' ? wordDur : (mode === 'letter' ? letterDur : 0)

    const [elementNum, setElementNum] = useState(0)

    const joinChar = mode === 'word' ? ' ' : ''

    const paddingSpaces = !line || mode !== 'letter' || line.charAt(elementNum - 1) === ' ' ? 0 : getNumberOfPaddingSpaces(line, elementNum)
    const text = elements.slice(0, elementNum).join(joinChar) + getSpaces(paddingSpaces)

    useEffect(() => {
      if(printingDone) {
        setElementNum(totalElements)
      }
    }, [printingDone, setElementNum, totalElements])
  
    useEffect(() => {
      isCutoff.current = false
      setElementNum(0)
    }, [line, setElementNum])

    const isDone = line !== undefined && (text === line || isCutoff.current)

    useEffect(() => {
      if(isDone) {
        setPrintingDone(true)
        return
      }
      const t = setInterval(() => {
        setElementNum(e => e + 1)
      }, elementDur)
      return () => clearInterval(t)
    }, [elementDur, isDone, setElementNum, setPrintingDone])
  
    const [x,y] = vector2ToTuple(position)

    return (<Text
      ref={ref}
      position={[x,y,1]}
      anchorX="left"
      anchorY="top"
      fontSize={fontSize}
      lineHeight={lineHeight}
      maxWidth={maxWidth}
      clipRect={[0, -trueMaxHeight, maxWidth, 0]}
      onSync={() => {
        if(typeof ref !== 'function' && ref && ref.current) {
          const height = new Box3().setFromObject(ref.current).getSize(new Vector3()).y
          if(height > maxHeight && !isCutoff.current) {
            isCutoff.current = true
            console.warn(`The following text is being cut off by the dialogue box window:\n"${line}"`)
          }
        }
      }}
      whiteSpace="normal"
      overflowWrap="normal"
      {...textProps}
  >
    {text}
  </Text>)
  


})

export default TeleprompterText