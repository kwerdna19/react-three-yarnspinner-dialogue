import { useThree } from "@react-three/fiber"
import useTrigger from "../hooks/useTrigger"
import useYarn, { YarnHookOptions } from "../hooks/useYarn"
import DialogueBox from "./DialogueBox"


export type YarnDialogProps = {
  yarn: string
} & Partial<YarnHookOptions>

export default function YarnDialogue({
  yarn,
  ...options
}: YarnDialogProps) {

  const width = useThree(s => s.size.width)
  const height = useThree(s => s.size.height)

  const {
    currentResult,
    setAllowedToAdvance,
    advance,
    character
  } = useYarn(yarn, options)

  useTrigger(advance)

  return <>
    <DialogueBox
      advance={advance}
      current={currentResult}
      setAllowedToAdvance={setAllowedToAdvance}
      textMode="letter"
      position={[-width/2, 0]}
    />
  
  </>
}