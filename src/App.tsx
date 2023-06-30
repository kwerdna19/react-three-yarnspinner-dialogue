import { Canvas, MeshProps, useFrame } from '@react-three/fiber'
import { YarnDialogue } from './components/YarnDialogue'
import { useRef, useState } from 'react'
import { Mesh } from 'three'

const exampleYarn = `title: Start
---
Companion: Hi there! What do you feel like doing today? What if this was a really really long line? What would happen? We need to wrap the text to new line or lines? What would happen? We need to wrap the text to new line or lines?
<<log 3 4 5 true test "true">>
Gambler: My lucky number is {random_range(1,10)}!
Debug: I have visited Start this many times: {visited_count("Start")}
Debug: I have visited swimming: {visited("Swimming")}
-> Player: I want to go swimming.
    Companion: Okay, let's go swimming.
    <<jump Swimming>>
-> Player: I want to go swimming 2.
    Companion: Okay, let's go swimming 2.
    <<jump Swimming>>
-> Player: I'd prefer to go hiking.
    Companion: Cool, we'll go hiking then.
    <<jump Hiking>>
===

title: Swimming
---
Companion: Where do you want to swim?
-> Player: The lake!
    Companion: Nice! It's a great day for it.
-> Player: The swimming pool!
    Companion: Oh, awesome! I heard they installed a new slide.
-> Player: Go back to start!
    Companion: Oh, awesome! I heard they installed a new slide.
    <<jump Start>>
<<jump Done>>
===

title: Hiking
---
Companion: Have you got your hiking boots ready?
-> Player: Yes.
    Companion: Great, let's go!
-> Player: No.
    Companion: We can swing by your place and pick them up!

<<jump Done>>
===
title: Done
---
Player: Sounds good!
===`

function Box(props: MeshProps) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)
  useFrame((_, delta) => {
    if(meshRef.current) {
      meshRef.current.rotation.x += delta
      meshRef.current.rotation.z += delta/2
    }
  })
  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}


function App() {

  const dialog = useRef<YarnDialogue>(null)

  return (
      <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box onClick={() => dialog.current?.advance()} />
      <YarnDialogue
        ref={dialog}
        yarn={exampleYarn}
        width="70%"
        height={150}
        transform={[0.5, 0]}
        padding={10}
        borderRadius={15}
        fontSize={18}
        bottom={40}
        skippable
        getCharacterLabelAttributes={({character}) => {
          if(character === 'Gambler') {
            return {
              labelColor: 'green',
            }
          }
          if(character === 'Companion') {
            return {
              labelColor: 'red',
              bg: 'blue'
            }
          }
        }}
        advanceOnClick
      />
    </Canvas> 
  )
}

export default App
