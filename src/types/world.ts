export type BoonId = 'fertility' | 'strength' | 'wisdom' | 'resilience';

export interface Boon {
  id: BoonId;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
}

export interface NamingProfile {
  phonemes: string;
  inspiration: string;
  languageStructure: string;
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical' | 'Catastrophic';
}

export interface PersonalLogEntry {
    year: number;
    entry: string;
    characterName?: string; // Optional: May not be needed if logs are nested in character
}

export interface DeathDetails {
    reason: string;
    favoriteThing: string;
    happiestMemory: string;
    lastThought: string;
}

export interface NotableCharacter {
  id: string;
  name: string;
  raceId: string;
  status: 'alive' | 'dead';
  deathYear?: number;
  deathDetails?: DeathDetails;
  // Character Sheet fields
  title: string;
  age: number;
  class: string;
  ambition: string;
  traits: string[];
  skills: string[];
  specialTraits: string[];
  personalLog: PersonalLogEntry[];
}


export interface PopulationChange {
    born: number;
    died: number;
    newPopulation: number;
}

export interface HistoryEntry {
    year: number;
    summary: string;
    populationChange: PopulationChange;
    events: string[];
    emergenceReason?: string;
}

export interface Culture {
    name: string;
    description: string;
}

export interface CultureLogEntry {
    year: number;
    eventName: string;
    summary: string;
}

export interface Race {
  id: string;
  name: string;
  population: number;
  namingProfile?: NamingProfile;
  racePoints: number;
  activeBoons: BoonId[];
  traits?: string;
  location?: string;
  problems?: Problem[];
  notableCharacters: NotableCharacter[];
  history: HistoryEntry[];
  status: string; // e.g., "Emerging", "Stable", "Declining"
  religion: { name: string; };
  government: { name: string; };
  culture: Culture;
  cultureLog: CultureLogEntry[];
}

export interface NarrativeEntry {
  year: number;
  type:
    | 'narrative'
    | 'population'
    | 'character'
    | 'problem'
    | 'society'
    | 'discovery'
    | 'cataclysm'
    | 'death'
    | 'user';
  content: string;
}

export interface World {
  id: string;
  name: string;
  era: string;
  currentYear: number;
  races: Race[];
  population: number;
  significantEvents: string[];
  cataclysmPreparations: string;
  narrativeLog: NarrativeEntry[];
}
