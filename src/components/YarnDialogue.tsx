import { GroupProps, Vector2, useThree } from "@react-three/fiber"
import useTrigger from "../hooks/useTrigger"
import useYarn, { YarnHookOptions } from "../hooks/useYarn"
import DialogueBox from "./DialogueBox"
import { vector2ToTuple } from "../utils"

type BaseYarnDialogueProps = {
  yarn: string,
  width?: number,
  position?: Vector2
}

export type YarnDialogProps = BaseYarnDialogueProps & Partial<YarnHookOptions> & Omit<GroupProps, keyof BaseYarnDialogueProps>

export default function YarnDialogue({
  yarn,
  skippable,
  defaultToFirstOption,
  position = [0, 0],
  width: _width
}: YarnDialogProps) {

  const canvasWidth = useThree(s => s.size.width)
  const canvasHeight = useThree(s => s.size.height)

  const width = _width !== undefined ? _width : canvasWidth

  const {
    currentResult,
    setAllowedToAdvance,
    advance,
    character
  } = useYarn(yarn, {
    skippable,
    defaultToFirstOption
  })

  useTrigger(advance)

  const [x, y] = vector2ToTuple(position)

  return <group position={[x, y, 0]}
  >
    <DialogueBox
      advance={advance}
      current={currentResult}
      setAllowedToAdvance={setAllowedToAdvance}
      textMode="letter"
      width={width}
    />
  
  </group>
}