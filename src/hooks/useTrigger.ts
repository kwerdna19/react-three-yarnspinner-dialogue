import { useThree } from "@react-three/fiber"
import { useEffect } from "react"


const useTrigger = (cb: () => void) => {

  const renderer = useThree(state => state.gl)

  useEffect(() => {
    function eventHandler(event: MouseEvent | KeyboardEvent) {
      if('key' in event && ![' ', 'Enter'].includes(event.key)) {
        return
      }
      cb()
    }
    const element = renderer.domElement
    element.addEventListener('mousedown', eventHandler)
    element.addEventListener('keydown', eventHandler)
    return () => {
      element.removeEventListener('click', eventHandler)
      element.removeEventListener('keydown', eventHandler)
    }
  }, [cb, renderer])

}

export default useTrigger