import { useYarnStore } from "../store";

// https://docs.yarnspinner.dev/getting-started/writing-in-yarn/functions
export const yarnFunctions = {
  visited: (nodeName: string) => {
    return useYarnStore.getState().nodeVisitsMap[nodeName] > 0;
  },
  visited_count: (nodeName: string) => {
    return useYarnStore.getState().nodeVisitsMap[nodeName] || 0;
  },
  random: Math.random,
  random_range: (low: number, high: number) => {
    const min = Math.ceil(low);
    const max = Math.floor(high);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  dice: (high = 6) => {
    const max = Math.floor(high);
    return Math.floor(Math.random() * max) + 1;
  },
  round: Math.round,
  round_places: (num: number, places: number) => {
    const multiplier = 10 ^ places;
    return Math.round(num * multiplier) / multiplier;
  },
  floor: Math.floor,
  ceil: Math.ceil,
  inc: (num: number) => {
    const c = Math.ceil(num);
    return c === num ? num + 1 : num;
  },
  dec: (num: number) => {
    const f = Math.floor(num);
    return f === num ? num - 1 : num;
  },
  decimal: (num: number) => {
    return num - Math.floor(num);
  },
  int: (num: number) => {
    const f = Math.floor(num);
    return Math.max(0, f);
  }
};
