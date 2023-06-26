// import { useThree } from "@react-three/fiber"
import { useEffect } from "react"


const useTrigger = (cb: () => void) => {

  // const renderer = useThree(state => state.gl)

  useEffect(() => {

    function eventHandler(event: MouseEvent | KeyboardEvent) {
      if('key' in event && ![' ', 'Enter'].includes(event.key)) {
        return
      }
      cb()
    }
    
    // const element = renderer.domElement

    window.addEventListener('click', eventHandler)
    window.addEventListener('keydown', eventHandler)
    return () => {
      window.removeEventListener('click', eventHandler)
      window.removeEventListener('keydown', eventHandler)
    }
  }, [cb])

}

export default useTrigger