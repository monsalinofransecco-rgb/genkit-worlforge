
// Defines all possible biomes
export type Biome = 'Plains' | 'Forest' | 'Mountains' | 'Ocean' | 'Desert' | 'Tundra';

// Defines the properties of a single tile on the map
export interface MapTile {
  id: string; // e.g., "tile-10-11"
  x: number;
  y: number;
  biome: Biome;
  resources: string[]; // e.g., ['wild_game', 'iron']
  // 'occupant' will be tracked on the Race object, not the map itself
}

const MAP_SIZE = 20;

// A simple function to create a new 20x20 world grid
export function generateWorldMap(): MapTile[] {
  const map: MapTile[] = [];
  const size = MAP_SIZE; // 20x20 grid

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const id = `tile-${x}-${y}`;
      let biome: Biome = 'Plains'; // Default
      
      // Simple logic to create varied biomes (you can make this complex)
      if (x < 3 || x > 17 || y < 3 || y > 17) {
        biome = 'Ocean';
      } else if (x > 5 && x < 8 && y > 5 && y < 8) {
        biome = 'Mountains';
      } else if (y > 15) {
        biome = 'Forest';
      }
      
      map.push({
        id: id,
        x: x,
        y: y,
        biome: biome,
        resources: [], // We can have the AI populate this later
      });
    }
  }
  return map;
}

// This is your "mental map"
export const worldMap = generateWorldMap();

/**
 * A helper function to find all adjacent tile IDs for a given tile.
 * This will be used on the frontend to reveal the "Fog of War".
 */
export function getAdjacentTileIds(tileId: string): string[] {
  const [_, xStr, yStr] = tileId.split('-');
  const x = parseInt(xStr);
  const y = parseInt(yStr);
  const adjacent = [];
  const MAX_INDEX = MAP_SIZE - 1;

  // Check neighbors (no diagonals)
  const directions = [
    { dx: 0, dy: -1 }, // North
    { dx: 0, dy: 1 },  // South
    { dx: -1, dy: 0 }, // West
    { dx: 1, dy: 0 },  // East
  ];

  for (const dir of directions) {
    const newX = x + dir.dx;
    const newY = y + dir.dy;

    // Check bounds
    if (newX >= 0 && newX <= MAX_INDEX && newY >= 0 && newY <= MAX_INDEX) {
      adjacent.push(`tile-${newX}-${newY}`);
    }
  }
  
  return adjacent;
}
