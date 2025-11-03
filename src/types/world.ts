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
  notableCharacters: NotableCharacter[];
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
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical' | 'Catastrophic';
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

export type BoonId = 'fertility' | 'strength' | 'wisdom' | 'resilience';

export interface Boon {
  id: BoonId;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
}
