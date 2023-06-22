import { Cone } from '@react-three/drei'
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'


type Props = {
  position?: [number, number],
  size?: number,
  color?: string
}

const NextDialogIndicator = ({
  position = [0, 0],
  size = 10,
  color = 'black'
}: Props) => {

  const indicatorRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime();
    if(indicatorRef.current) {
      indicatorRef.current.position.y = Math.sin(a * 6)*size*0.33 + position[1] + size*1.5;
    }
  });

  return <Cone ref={indicatorRef} args={[size/2, size]} position={[...position, 0]} rotation={[0, 0, Math.PI]} material-color={color}  />
}

export default NextDialogIndicator