'use client';

import type { World, Race } from '@/types/world';

const WORLDS_STORAGE_KEY = 'worldforge-chronicles-worlds';

function safeJsonParse<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.error('Failed to parse JSON from localStorage', e);
    return null;
  }
}

export function getWorlds(): World[] {
  if (typeof window === 'undefined') return [];
  const worldsJson = localStorage.getItem(WORLDS_STORAGE_KEY);
  return safeJsonParse<World[]>(worldsJson) || [];
}

export function getWorldById(id: string): World | null {
  const worlds = getWorlds();
  return worlds.find((world) => world.id === id) || null;
}

export function saveWorld(world: World): void {
  if (typeof window === 'undefined') return;
  const worlds = getWorlds();
  const worldIndex = worlds.findIndex((w) => w.id === world.id);
  if (worldIndex > -1) {
    worlds[worldIndex] = world;
  } else {
    worlds.push(world);
  }
  localStorage.setItem(WORLDS_STORAGE_KEY, JSON.stringify(worlds));
}

export function deleteWorld(worldId: string): void {
  if (typeof window === 'undefined') return;
  const worlds = getWorlds();
  const newWorlds = worlds.filter(w => w.id !== worldId);
  localStorage.setItem(WORLDS_STORAGE_KEY, JSON.stringify(newWorlds));
}


// Preliminary world creation
export function createPreliminaryWorld(name: string, raceCount: number): World {
    const worldId = "world_" + Date.now();

    const newWorld: World = {
      id: worldId,
      name: name,
      era: "Primal Era",
      currentYear: 1,
      races: Array.from({ length: raceCount }, () => ({
        id: crypto.randomUUID(),
        name: '',
        population: 1000,
        racePoints: 100,
        activeBoons: [],
      })),
      population: 0,
      significantEvents: [`The world of ${name} was forged.`],
      cataclysmPreparations: 'None',
      narrativeLog: [
        {
          year: 1,
          type: 'narrative',
          content: `In the beginning, the world of ${name} was created, marking the start of the Primal Era.`,
        },
      ],
      notableCharacters: [],
    };

    saveWorld(newWorld);
    return newWorld;
}

// Kept for backwards compatibility or potential future use, but might be deprecated.
export function createWorld(name: string, era: string, raceCount: number): World {
  const newWorld: World = {
    id: crypto.randomUUID(),
    name,
    era,
    currentYear: 0,
    races: Array.from({ length: raceCount }, (_, i) => {
        const raceId = crypto.randomUUID();
        return {
            id: raceId,
            name: `Unnamed Race ${raceId}`,
            population: 1000,
            racePoints: 100,
            activeBoons: [],
        }
    }),
    population: 1000 * raceCount,
    significantEvents: [`The world of ${name} was forged in the ${era}.`],
    cataclysmPreparations: 'None',
    narrativeLog: [
      {
        year: 0,
        type: 'narrative',
        content: `In the beginning, the world of ${name} was created, marking the start of the ${era}.`,
      },
    ],
    notableCharacters: [],
  };
  saveWorld(newWorld);
  return newWorld;
}