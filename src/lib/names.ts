export const ADJECTIVES = [
  'Brave',
  'Calm',
  'Clever',
  'Cozy',
  'Curious',
  'Gentle',
  'Happy',
  'Jolly',
  'Lucky',
  'Mellow',
  'Merry',
  'Nimble',
  'Plucky',
  'Quiet',
  'Sunny',
  'Witty',
] as const;

export const ANIMALS = [
  'Otter',
  'Fox',
  'Panda',
  'Owl',
  'Hedgehog',
  'Koala',
  'Rabbit',
  'Badger',
  'Heron',
  'Lynx',
  'Seal',
  'Wren',
  'Finch',
  'Newt',
  'Beaver',
  'Gecko',
] as const;

export function randomName(rng: () => number = Math.random): string {
  const adjIndex = Math.floor(rng() * ADJECTIVES.length);
  const animalIndex = Math.floor(rng() * ANIMALS.length);
  const adj = ADJECTIVES[Math.min(adjIndex, ADJECTIVES.length - 1)];
  const animal = ANIMALS[Math.min(animalIndex, ANIMALS.length - 1)];
  return `${adj} ${animal}`;
}
