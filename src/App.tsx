import { Canvas } from '@react-three/fiber'
import Grid from './components/GridHelper'
import YarnDialogue from './components/YarnDialogue'

const chapter1 = `title: Start
---
Companion: Hi there! What do you feel like doing today? What if this was a really really long line? What would happen? We need to wrap the text to new line or lines? What would happen? We need to wrap the text to new line or lines?
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

// const chapter2 = `title: Start
// ---
// Companion: Hi there! Welcome to chapter 2?
// <<log 3 4 5 true test "true">>
// Gambler: My lucky number is {random_range(1,10)}!
// <<alert "test message">>
// Debug: I have visited Start this many times: {visited_count("Start")}
// Debug: I have visited swimming: {visited("Swimming")}
// -> Player: I want to go swimming.
//     Companion: Okay, let's go swimming.
//     <<jump Swimming>>
// -> Player: I want to go swimming 2.
//     Companion: Okay, let's go swimming 2.
//     <<jump Swimming>>
// -> Player: I'd prefer to go hiking.
//     Companion: Cool, we'll go hiking then.
//     <<jump Hiking>>
// ===

// title: Swimming
// ---
// Companion: Where do you want to swim?
// -> Player: The lake!
//     Companion: Nice! It's a great day for it.
// -> Player: The swimming pool!
//     Companion: Oh, awesome! I heard they installed a new slide.
// -> Player: Go back to start!
//     Companion: Oh, awesome! I heard they installed a new slide.
//     <<jump Start>>
// <<jump Done>>
// ===

// title: Hiking
// ---
// Companion: Have you got your hiking boots ready?
// -> Player: Yes.
//     Companion: Great, let's go!
// -> Player: No.
//     Companion: We can swing by your place and pick them up!

// <<jump Done>>
// ===
// title: Done
// ---
// Player: Sounds good!
// ===`

function Demo() {

  return <>
    <Grid />
    <YarnDialogue yarn={chapter1} />
  </>
}

function App() {

  return (
    <Canvas camera={{position: [0,0,10]}} orthographic>
      <Demo />
    </Canvas>
  )
}

export default App
