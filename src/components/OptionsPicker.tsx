import { Text } from "@react-three/drei"
import { Vector3 } from "@react-three/fiber"
import { useCallback, useEffect, useRef, useState } from "react"
import { OptionResult } from 'yarn-bound'
import { Box3, Group, Vector3 as Vector } from 'three'
import { useOptions } from "../hooks/useYarnStore"

// range from 1-10 (technically 0.1 - 500)

type Props = {
  fontSize?: number,
  speed?: number,
  options: OptionResult[]
  onSelection: (selectionIndex: number) => void,
  position?: Vector3,
  onHeightMeasure?: (height: number) => void
  fontColor?: string
  defaultToFirstOption?: boolean
}

const OptionsPicker = ({
  fontSize = 16,
  fontColor,
  options,
  onSelection,
  position,
  onHeightMeasure,
  defaultToFirstOption = false
}: Props) => {

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

  }, [onSelection, selectedIndex, setSelectedIndex, numOptions, defaultSelection])
  
  useEffect(() => {
    window.addEventListener('keydown', keyboardControlHandler)
    return () => {
      window.removeEventListener('keydown', keyboardControlHandler)
    }
  }, [keyboardControlHandler])

  return ( <group position={position} ref={ref} onAfterRender={() => {
    if(ref.current) {
      const newHeight = new Box3().setFromObject(ref.current).getSize(new Vector()).y;
      console.log('newHeight', newHeight)
      onHeightMeasure?.(newHeight)
    }
  }}>
    {options.map((o, i) => {
      const isSelected = selectedIndex === i
      return <Text
        key={i}
        color={fontColor}
        fontSize={fontSize}
        outlineWidth={isSelected ? '2%' : 0}
        onClick={() => onSelection(i)}
        onPointerOver={() => setSelectedIndex(i)}
        anchorX="left" anchorY="top"
        position={[0, -1.25*fontSize*i, 0]}
    >
      {isSelected ? '> ' : ''}{o.text}
    </Text>
    })}
  </group>)
}

export default OptionsPicker