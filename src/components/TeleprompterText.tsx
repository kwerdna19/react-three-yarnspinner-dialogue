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

export type TeleprompterTextProps = BaseTeleprompterTextProps & Omit<TextProps, 'anchorX' | 'anchorY' | 'ref' | 'children' | keyof BaseTeleprompterTextProps>

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
    const text = elements.slice(0, elementNum).join(joinChar)

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
            console.warn(`The following text is being cut off:\n"${line}"`)
          }
        }
      }}
      {...textProps}
  >
    {text}
  </Text>)
  


})

export default TeleprompterText