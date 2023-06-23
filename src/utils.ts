import { Vector2 } from '@react-three/fiber';
import { CurrentResult } from 'yarn-bound';


export const getCharacter = (result: CurrentResult) => {
  return result?.markup.find(m => m.name === 'character')?.properties?.name
}

export function clamp(input: number, min: number, max: number): number {
  return input < min ? min : input > max ? max : input;
}

export function mapOverRange(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
  const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  return clamp(mapped, out_min, out_max);
}

export function vector2ToTuple(v?: Vector2) {
  if(!v) {
    return [0, 0] as const
  }
  if(Array.isArray(v) || v instanceof Array) {
    return v
  }
  if(typeof v === 'number') {
    return [v, v] as const
  }
  return [v.x, v.y] as const  
}