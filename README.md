# React Three Fiber YarnSpinner Dialogue Box


- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) ([Three.js](https://threejs.org/) + [React](https://react.dev/))
 - [React Three Drei](https://github.com/pmndrs/drei)
- [YarnSpinner](https://yarnspinner.dev/) dialog syntax


A text scrolling dialog box for story-game-style dialog or narration.

## Installation

```
 npm i react-three-yarnspinner-dialogue
 # or
 yarn add react-three-yarnspinner-dialogue
```

## Usage

### <YarnDialogue\/>

- TBD: add props


## Example

```tsx
  <YarnDialogue
    yarn={exampleYarn}
    width="70%"
    height={150}
    transform={[0.5, 0]}
    padding={10}
    bottom={40}
    skippable
    getCharacterLabelAttributes={({character}) => {
      if(character === 'Companion') {
        return {
          labelColor: 'red',
        }
      }
    }}
  />
```