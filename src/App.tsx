import { Canvas } from '@react-three/fiber'
import YarnDialogue from './components/YarnDialogue'
import { useState } from 'react'
import DemoBox from './components/DemoBox'

const chapter1 = `title: Start
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

const chapter2 = `title: Start
---
Companion: Hi there! Welcome to chapter 2?
<<log 3 4 5 true test "true">>
Gambler: My lucky number is {random_range(1,10)}!
<<alert "test message">>
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

const chapters = [chapter1, chapter2]

function Demo({ text }: { text: string }) {


  return <YarnDialogue
      yarn={text}
      width="70%"
      height={150}
      transform={[0.5, 0]}
      padding={10}
      borderRadius={15}
      fontSize={18}
      bottom={40}
      skippable
    />
}

function App() {

  const [chapter, setChapter] = useState(0)

  return (
    <>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <DemoBox position={[-1.2, 0, 0]} />
        <DemoBox position={[1.2, 0, 0]} />
        <Demo text={chapters[chapter]} />
      </Canvas>
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <button onClick={() => setChapter(c => c === 0 ? 1 : 0)}>
          Chapter {chapter + 1}
        </button>
      </div>
    </>
  )
}

export default App
