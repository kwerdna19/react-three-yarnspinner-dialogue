import { useCallback, useState } from "react";

export default function useForceUpdate(){
  const [,setValue] = useState(0); // integer state
  return useCallback(() => {
    setValue(value => value + 1)
  }, [])
}