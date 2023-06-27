import { Text } from "@react-three/drei"
import { Vector2 } from "@react-three/fiber"
import { useCallback, useEffect, useRef, useState } from "react"
import { OptionResult } from 'yarn-bound'
import { Box3, Group, Vector3 as Vector } from 'three'
import { vector2ToTuple } from "../utils"


type OptionsPickerProps = {
  fontSize?: number,
  lineHeight?: number,
  speed?: number,
  options: OptionResult[]
  onSelection: (selectionIndex: number) => void,
  position?: Vector2,
  onHeightMeasure?: (height: number) => void
  fontColor?: string
  defaultToFirstOption?: boolean
}

const OptionsPicker = ({
  fontSize = 16,
  lineHeight = 1,
  fontColor,
  options,
  onSelection,
  position,
  onHeightMeasure,
  defaultToFirstOption = false
}: OptionsPickerProps) => {

  const [x,y] = vector2ToTuple(position)

  const ref = useRef<Group>(null)

  // @TODO would love a better way to do this
  useEffect(() => {
    if(ref.current && onHeightMeasure) {
      const newHeight = new Box3().setFromObject(ref.current).getSize(new Vector()).y;
      if(newHeight) {
        onHeightMeasure(newHeight)
      }
      setTimeout(() => ref.current && onHeightMeasure(new Box3().setFromObject(ref.current).getSize(new Vector()).y), 100)
      return
    }
  }, [onHeightMeasure])

  const defaultSelection = defaultToFirstOption ? 0 : null
  const [selectedIndex, setSelectedIndex] = useState(defaultSelection)
  const numOptions = options.length

  const keyboardControlHandler = useCallback((event: KeyboardEvent) => {
    if(event.key === 'ArrowDown') {
      setSelectedIndex(s => {
        if(s === null) {
          return 0
        }
        return s+1 > numOptions-1 ? 0 : s+1
      })
      return
    }
    if(event.key === 'ArrowUp') {
      setSelectedIndex(s => {
        if(s === null) {
          return numOptions - 1
        }
        return s-1 < 0 ? numOptions-1 : s-1
      })
      return
    }

    if([' ', 'Enter'].includes(event.key)) {
      if(selectedIndex !== null) {
        onSelection(selectedIndex)
      }
      setSelectedIndex(defaultSelection)
    }

    if(event.key === 'Escape') {
      setSelectedIndex(null)
    }

  }, [onSelection, selectedIndex, setSelectedIndex, numOptions, defaultSelection])
  
  useEffect(() => {
    window.addEventListener('keydown', keyboardControlHandler)
    return () => {
      window.removeEventListener('keydown', keyboardControlHandler)
    }
  }, [keyboardControlHandler])

  return ( <group position={[x,y,1]} ref={ref}>
    {options.map((o, i) => {
      const isSelected = selectedIndex === i
      return <Text
        key={i}
        color={fontColor}
        fontSize={fontSize}
        outlineWidth={isSelected ? '2%' : 0}
        onClick={() => onSelection(i)}
        onPointerOver={() => setSelectedIndex(i)}
        anchorX="left"
        anchorY="top"
        position={[0, -1*lineHeight*fontSize*i, 0]}
    >
      {isSelected ? '> ' : ''}{o.text}
    </Text>
    })}
  </group>)
}

export default OptionsPicker