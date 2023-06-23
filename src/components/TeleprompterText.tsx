import { Text } from "@react-three/drei"
import { Vector2 } from "@react-three/fiber"
import { ComponentProps, forwardRef, useCallback, useEffect, useState } from "react"
import { Mesh, Box3, Vector3 } from 'three';
import useTrigger from "../hooks/useTrigger"
import { vector2ToTuple } from "../utils"

// range from 1-10 (technically > 0 && <= 500)
// 0.1 = 5 sec / word --> 500 = 1 ms / word

type TextProps = ComponentProps<typeof Text>

type BaseTeleprompterTextProps = {
  line: string,
  speed?: number,
  onPrintEnd?: (returnedEarly?: boolean) => void,
  mode?: 'word' | 'letter' | 'instant',
  position?: Vector2
}

export type TeleprompterTextProps = BaseTeleprompterTextProps & Omit<TextProps, 'anchorX' | 'anchorY' | 'ref' | 'children' | keyof BaseTeleprompterTextProps>

const TeleprompterText = forwardRef<Mesh, TeleprompterTextProps>(({
  line,
  speed = 6,
  onPrintEnd,
  position,
  mode = 'word',
  ...textProps
}: TeleprompterTextProps, ref) => {

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

    const [x,y] = vector2ToTuple(position)

    useEffect(() => {
      if(!ref || typeof ref === 'function' || !ref.current) {
        return
      }

      const node = ref.current
      

      function onComplete() {
        const h = new Box3().setFromObject(node).getSize(new Vector3()).y
        console.log(node, h)
      }

      node.addEventListener('synccomplete', onComplete)

      return () => node.removeEventListener('synccomplete', onComplete)

    }, [])
  
    return (<Text
      ref={ref}
      position={[x,y,1]}
      anchorX="left"
      anchorY="top"
      {...textProps}
  >
    {text}
  </Text>)
  


})

export default TeleprompterText