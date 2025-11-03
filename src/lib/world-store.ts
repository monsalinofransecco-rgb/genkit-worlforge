'use client';

import type { World, Race, HistoryEntry, NotableCharacter, Culture, CultureLogEntry } from '@/types/world';

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
  const worlds = safeJsonParse<World[]>(worldsJson) || [];
  // Data migration for older world structures
  return worlds.map(world => {
    return {
      ...world,
      races: world.races.map(race => {
        const history: HistoryEntry[] = race.history || [];
        const notableCharacters: NotableCharacter[] = (race.notableCharacters || (world as any).notableCharacters || []).map((c: any) => ({
            ...c,
            personalLog: c.personalLog || [],
            traits: c.traits || [],
            skills: c.skills || [],
            specialTraits: c.specialTraits || [],
        }));

        return {
          ...race,
          history,
          notableCharacters,
          status: race.status || "Emerging",
          religion: race.religion || { name: "Animism" },
          government: race.government || { name: "Tribal" },
          culture: race.culture || { name: "Nascent", description: "A culture centered on basic survival. All value is placed on finding food, seeking shelter, and protecting the young. There are no formal traditions, art forms, or spiritual beliefs beyond simple superstitions." },
          cultureLog: race.cultureLog || [],
        };
      }),
      notableCharacters: [], // Moved to race level
    };
  });
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
        problems: [],
        notableCharacters: [],
        history: [],
        status: "Emerging",
        religion: { name: "Animism" },
        government: { name: "Tribal" },
        culture: { name: "Nascent", description: "A culture centered on basic survival. All value is placed on finding food, seeking shelter, and protecting the young. There are no formal traditions, art forms, or spiritual beliefs beyond simple superstitions." },
        cultureLog: [],
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
    };

    saveWorld(newWorld);
    return newWorld;
}
