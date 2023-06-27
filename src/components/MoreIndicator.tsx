import { Cone } from '@react-three/drei'
import { useRef } from 'react';
import { Vector2, useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { vector2ToTuple } from '../utils';


type Props = {
  position?: Vector2,
  size?: number,
  color?: string
}

const MoreIndicator = ({
  position = [0, 0],
  size = 10,
  color = 'black'
}: Props) => {

  const [x, y] = vector2ToTuple(position)

  const indicatorRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    const a = clock.getElapsedTime();
    if(indicatorRef.current) {
      indicatorRef.current.position.y = Math.sin(a * 6)*size*0.33 + y + size*1.5;
    }
  });

  return <Cone ref={indicatorRef} args={[size/2, size]} position={[x, y, 0]} rotation={[0, 0, Math.PI]} material-color={color}  />
}

export default MoreIndicator