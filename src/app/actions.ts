'use server';

import {
  advanceTimeAndGenerateNarrativeEvents,
  type AdvanceTimeAndGenerateNarrativeEventsInput,
  type AdvanceTimeAndGenerateNarrativeEventsOutput,
} from '@/ai/flows/advance-time-and-generate-narrative-events';
import {
  generateRaceNamingProfile,
  type GenerateRaceNamingProfileInput,
} from '@/ai/flows/generate-race-naming-profile';
import {
  simulateCataclysmEvent,
  type SimulateCataclysmEventInput,
} from '@/ai/flows/simulate-cataclysm-events';
import {
  simulateNotableCharacterDeaths,
  type SimulateNotableCharacterDeathsInput,
} from '@/ai/flows/simulate-notable-character-deaths';

export async function runAdvanceTime(
  input: AdvanceTimeAndGenerateNarrativeEventsInput
): Promise<{ success: true, data: AdvanceTimeAndGenerateNarrativeEventsOutput } | { success: false, error: string }> {
  try {
    const result = await advanceTimeAndGenerateNarrativeEvents(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in runAdvanceTime:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to advance time.';
    return { success: false, error: errorMessage };
  }
}

export async function runGenerateRaceNamingProfile(
  input: GenerateRaceNamingProfileInput
) {
  try {
    const result = await generateRaceNamingProfile(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in runGenerateRaceNamingProfile:', error);
    return { success: false, error: 'Failed to generate naming profile.' };
  }
}

export async function runSimulateCataclysm(input: SimulateCataclysmEventInput) {
  try {
    const result = await simulateCataclysmEvent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in runSimulateCataclysm:', error);
    return { success: false, error: 'Failed to simulate cataclysm.' };
  }
}

export async function runSimulateNotableCharacterDeaths(
  input: SimulateNotableCharacterDeathsInput
) {
  try {
    const result = await simulateNotableCharacterDeaths(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in runSimulateNotableCharacterDeaths:', error);
    return { success: false, error: 'Failed to simulate deaths.' };
  }
}
