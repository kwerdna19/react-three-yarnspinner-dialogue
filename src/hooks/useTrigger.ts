import { useEffect } from "react"


const useTrigger = (cb: () => void) => {

  useEffect(() => {

    function eventHandler(event: MouseEvent | KeyboardEvent) {
      if('key' in event) {
        // keyboard event
        if([' ', 'Enter'].includes(event.key)) {
          // @TODO add more checking so other typing doesn't cause trigger
          cb()
        }
      } else {
        // mouse event
        if(event.target && event.target instanceof HTMLCanvasElement) {
          cb()
        }
      }
      

    }
    
    window.addEventListener('click', eventHandler)
    window.addEventListener('keydown', eventHandler)
    return () => {
      window.removeEventListener('click', eventHandler)
      window.removeEventListener('keydown', eventHandler)
    }
  }, [cb])

}

export default useTrigger