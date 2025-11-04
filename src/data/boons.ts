export type BoonDuration = 'Next Era' | 'Permanent' | 'Single Event';
export type BoonCategory = 'Intervention' | 'Survival' | 'Society' | 'Leadership';
export type BoonTarget = 'Self' | 'OtherRace' | 'Character';

export interface Boon {
  id: string;
  name: string;
  description: string;
  cost: number;
  duration: BoonDuration;
  category: BoonCategory;
  targetType: BoonTarget; // Helps the UI know what to do
}

// This is your complete store inventory
export const creatorStoreBoons: Boon[] = [
  // --- Divine Intervention ---
  {
    id: 'possess_animal',
    name: 'Possess Animal',
    description: 'Possess an animal to subtly influence a race.',
    cost: 100,
    duration: 'Single Event',
    category: 'Intervention',
    targetType: 'Self', // 'Self' here means it needs a text prompt
  },
  {
    id: 'appear_in_dreams',
    name: 'Appear in Dreams',
    description: 'Send a powerful dream to a specific notable character.',
    cost: 150,
    duration: 'Single Event',
    category: 'Intervention',
    targetType: 'Character', // This will trigger the modal
  },
  {
    id: 'whisper_of_attraction',
    name: 'Whisper of Attraction',
    description: 'Nudge two notable characters towards a specific bond.',
    cost: 100,
    duration: 'Single Event',
    category: 'Intervention',
    targetType: 'Character', // This will trigger the modal (for 2 chars)
  },

  // --- Survival & Growth ---
  {
    id: 'pop_boom_1',
    name: 'Boon of Fertility',
    description: 'Increases population growth for one cycle.',
    cost: 100,
    duration: 'Next Era',
    category: 'Survival',
    targetType: 'Self',
  },
  {
    id: 'resilience_1',
    name: 'Boon of Resilience',
    description: 'Resist famine and minor diseases for one cycle.',
    cost: 150,
    duration: 'Next Era',
    category: 'Survival',
    targetType: 'Self',
  },
  {
    id: 'favorable_harvests',
    name: 'Favorable Harvests',
    description: 'Ensures a good food supply for the next cycle.',
    cost: 150, // Updated cost per our discussion
    duration: 'Next Era',
    category: 'Survival',
    targetType: 'Self',
  },

  // --- Society & Innovation ---
  {
    id: 'inno_burst_1',
    name: 'Boon of Discovery',
    description: 'A significant primal discovery is made.',
    cost: 150,
    duration: 'Next Era',
    category: 'Society',
    targetType: 'Self',
  },
  {
    id: 'gov_reform',
    name: 'Governmental Reform',
    description: 'A societal push to reform the government structure.',
    cost: 300,
    duration: 'Next Era',
    category: 'Society',
    targetType: 'Self',
  },

  // --- Leadership ---
  {
    id: 'great_leader',
    name: 'Boon of Heroism',
    description: 'A notable hero rises to prominence.',
    cost: 250,
    duration: 'Next Era',
    category: 'Leadership',
    targetType: 'Self',
  },

  // --- Permanent Boons ---
  {
    id: 'oral_tradition',
    name: 'Boon of Shared Memory',
    description: 'Develops a robust oral history, preserving culture.',
    cost: 50,
    duration: 'Permanent',
    category: 'Society',
    targetType: 'Self',
  },
];