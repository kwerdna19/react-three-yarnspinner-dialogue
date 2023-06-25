import { GroupProps, Vector2, useThree } from "@react-three/fiber"
import useTrigger from "../hooks/useTrigger"
import useYarn, { YarnHookOptions } from "../hooks/useYarn"
import DialogueBox from "./DialogueBox"
import { vector2ToTuple } from "../utils"

type BaseYarnDialogueProps = {
  yarn: string,
  width: number,
  height: number
  position?: Vector2
}

export type YarnDialogProps = BaseYarnDialogueProps & Partial<YarnHookOptions> & Omit<GroupProps, keyof BaseYarnDialogueProps>

export default function YarnDialogue({
  yarn,
  skippable,
  defaultToFirstOption,
  position = [0, 0],
  width,
  height
}: YarnDialogProps) {

  const [x, y] = vector2ToTuple(position)

  const {
    currentResult,
    setAllowedToAdvance,
    advance,
    character
  } = useYarn(yarn, {
    skippable,
    defaultToFirstOption
  })

  return <group position={[x, y, 0]}
  >
    <DialogueBox
      advance={advance}
      current={currentResult}
      setAllowedToAdvance={setAllowedToAdvance}
      width={width}
      height={height}

      // move up ---
      textMode="word"
      fontSize={30}
      lineHeight={1.3}
      textSpeed={3}
      padding={5}
    />
  
  </group>
}