export interface World {
  id: string;
  name: string;
  era: string;
  currentYear: number;
  races: Race[];
  population: number;
  significantEvents: string[];
  boons: string[];
  cataclysmPreparations: string;
  narrativeLog: NarrativeEntry[];
  notableCharacters: NotableCharacter[];
}

export interface Race {
  id: string;
  name: string;
  population: number;
  namingProfile?: NamingProfile;
}

export interface NamingProfile {
  phonemes: string;
  inspiration: string;
  languageStructure: string;
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

export interface NotableCharacter {
  id: string;
  name: string;
  raceId: string;
  status: 'alive' | 'dead';
  deathYear?: number;
  deathNarrative?: string;
}

export type Boon = 'fertility' | 'strength' | 'wisdom' | 'resilience';
