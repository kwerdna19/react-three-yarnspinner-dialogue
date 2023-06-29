import { Hud, PerspectiveCamera } from "@react-three/drei";


export function TestComponent() {

  return (<Hud>
    <PerspectiveCamera makeDefault position={[0, 0, 10]} />
    <mesh>
      <ringGeometry />
    </mesh>
  </Hud>)
}