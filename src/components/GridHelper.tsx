import { useThree } from '@react-three/fiber';

function Grid({ divisions = 10 }: { divisions?: number }) {
  const width = useThree(state => state.size.width)
  const height = useThree(state => state.size.height)
  const size = Math.min(width, height)
  return <gridHelper args={[size, divisions, '#0000FF']} rotation={[Math.PI / 2, 0, 0]} />
}

export default Grid