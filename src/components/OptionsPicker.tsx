import { Text } from "@react-three/drei"
import { Vector2 } from "@react-three/fiber"
import { forwardRef } from "react"
import { OptionResult } from 'yarn-bound'
import { Group } from 'three'
import { vector2ToTuple } from "../utils"


type OptionsPickerProps = {
  fontSize?: number,
  lineHeight?: number,
  speed?: number,
  options: OptionResult[]
  onSelection: (selectionIndex: number) => void,
  position?: Vector2,
  fontColor?: string
  selectedIndex: number | null,
  setSelectedIndex: (index: number | null) => void 
}

const OptionsPicker = forwardRef<Group, OptionsPickerProps>(
  ({
  fontSize = 16,
  lineHeight = 1,
  fontColor,
  options,
  onSelection,
  position,
  selectedIndex,
  setSelectedIndex,
}: OptionsPickerProps, ref) => {

  const [x,y] = vector2ToTuple(position)

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
})

export default OptionsPicker