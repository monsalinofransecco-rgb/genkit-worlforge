
'use server';

/**
 * @fileOverview Advances time in the simulation and generates narrative events for all races.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { BoonId } from '@/types/world';

// Schemas for Character data structures
const CharacterTraitSchema = z.string();
const CharacterSkillSchema = z.string();

const PersonalLogEntrySchema = z.object({
    year: z.number(),
    entry: z.string(),
});

const LivingCharacterSchema = z.object({
    id: z.string(),
    name: z.string(),
    age: z.number(),
    title: z.string(),
    class: z.string(),
    ambition: z.string(),
    traits: z.array(CharacterTraitSchema),
    skills: z.array(CharacterSkillSchema),
});
type LivingCharacter = z.infer<typeof LivingCharacterSchema>;

const NewCharacterSchema = z.object({
    id: z.string().describe("A new crypto.randomUUID() for the character."),
    name: z.string().describe("A fitting name for the character based on their emergence."),
    age: z.number().describe("The character's starting age, appropriate for their story."),
    title: z.string().describe("A title earned through their emergence, e.g., 'the Pathfinder'."),
    class: z.string().describe("A class representing their role, e.g., 'Hunter', 'Seeker', 'Leader'."),
    ambition: z.enum(["Survival", "Power", "Knowledge", "Community"]).describe("Their primary life goal."),
    traits: z.array(CharacterTraitSchema).max(3).describe("Up to 3 personality traits (e.g., 'Brave', 'Resourceful', 'Cynical')."),
    skills: z.array(CharacterSkillSchema).max(3).describe("Up to 3 practical skills (e.g., 'Tracking', 'Herbalism', 'Storytelling')."),
    specialTraits: z.array(CharacterTraitSchema).max(2).describe("Up to 2 unique or rare traits (e.g., 'Forest-Wise', 'Fire-Resistant')."),
    firstLogEntry: z.string().describe("The character's first emotional thought, in the first-person, tied to their emergence reason. This MUST NOT be generic. It must be an emotional reflection.")
});

const CharacterLogEntrySchema = z.object({
    characterId: z.string().describe("The ID of the living character this log entry belongs to."),
    logEntry: z.string().describe("The new personal log entry, written in the first person, reflecting on the era's events.")
});

// Schemas for the main flow
const ProblemSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical', 'Catastrophic']),
});

const RaceSimulationInputSchema = z.object({
    id: z.string(),
    name: z.string(),
    population: z.number(),
    traits: z.string().describe("Comma-separated list of the race's core traits, e.g., 'Hardy, Industrious'"),
    location: z.string().describe("The race's primary location, e.g., 'Crystal Mountains'"),
    livingCharacters: z.array(LivingCharacterSchema).describe("A list of all currently living notable characters for this race."),
    problems: z.array(ProblemSchema).optional().describe('A list of current problems the race is facing.'),
    activeBoons: z.array(z.string()).describe("An array of active boon IDs, e.g., ['fertility', 'strength']."),
});

const AdvanceTimeAndGenerateNarrativeEventsInputSchema = z.object({
  years: z.number().describe('The number of years to advance time by (1 or 10).'),
  worldName: z.string().describe('The name of the world.'),
  era: z.string().describe('The current era of the world (e.g., "Primal Era").'),
  currentYear: z.number().describe('The current year in the world.'),
  races: z.array(RaceSimulationInputSchema).describe("An array of all races to be simulated."),
  chronicleEntry: z.string().optional().describe('The latest user-written chronicle entry to influence events.'),
});
export type AdvanceTimeAndGenerateNarrativeEventsInput = z.infer<typeof AdvanceTimeAndGenerateNarrativeEventsInputSchema>;

const RaceSimulationResultSchema = z.object({
    raceId: z.string().describe("The ID of the race that was simulated."),
    summary: z.string().describe("A 3rd person, 'historian' voice summary of the main events, successes, and failures for this race during the era. This MUST be written from a PRIMAL, SIMPLE, and SUPERSTITIOUS perspective."),
    populationChange: z.object({
        born: z.number().describe("Number of births during this period."),
        died: z.number().describe("Number of deaths during this period."),
        newPopulation: z.number().describe("The final population after births and deaths.")
    }),
    events: z.array(z.string()).describe("A bullet-point list of key notable events that occurred for this race."),
    emergenceReason: z.string().optional().describe("If a new character emerged, a description of why they emerged. This is tied to their backstory."),
    updatedProblems: z.array(ProblemSchema).describe('The updated list of all active problems after the simulation for this race.'),
    newCharacter: NewCharacterSchema.optional().describe("The full data for a new notable character, if one emerged this era for this race."),
    characterLogEntries: z.array(CharacterLogEntrySchema).describe("An array of new personal log entries, one for EACH living character for this race passed in the input."),
});

const AdvanceTimeAndGenerateNarrativeEventsOutputSchema = z.object({
    newYear: z.number().describe('The new current year in the world.'),
    raceResults: z.array(RaceSimulationResultSchema).describe("An array of simulation results, one for each race."),
});
export type AdvanceTimeAndGenerateNarrativeEventsOutput = z.infer<typeof AdvanceTimeAndGenerateNarrativeEventsOutputSchema>;

export async function advanceTimeAndGenerateNarrativeEvents(input: AdvanceTimeAndGenerateNarrativeEventsInput): Promise<AdvanceTimeAndGenerateNarrativeEventsOutput> {
  return advanceTimeAndGenerateNarrativeEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advanceTimeAndGenerateNarrativeEventsPrompt',
  input: {schema: AdvanceTimeAndGenerateNarrativeEventsInputSchema},
  output: {schema: AdvanceTimeAndGenerateNarrativeEventsOutputSchema},
  prompt: `
You are a 'Primal Era' Simulator. Your worldview MUST be PRIMEVAL, SIMPLE, and SUPERSTITIOUS. Your goals are Survival, Safety, and Basic Understanding (e.g., 'The sickness is an angry spirit'). You are FORBIDDEN from generating narratives with complex concepts like 'long-term planning,' 'economics,' or 'philosophy.'

You are simulating the world of {{{worldName}}}. It is year {{currentYear}}.
The Creator's guidance for this era: {{#if chronicleEntry}}"{{chronicleEntry}}"{{else}}None{{/if}}.

You will simulate {{years}} years for EACH of the following races. For each race, you will generate a separate result object within the 'raceResults' array.

RACES TO SIMULATE:
{{#each races}}
- Race: {{name}} (ID: {{id}})
  - Traits: {{traits}}
  - Location: {{location}}
  - Population: {{population}}
  - Living Characters: {{livingCharacters.length}}
  - Active Boons: {{#if activeBoons}}{{#each activeBoons}}'{{this}}' {{/each}}{{else}}None{{/if}}
  - Existing Problems: {{#if problems}}{{#each problems}}{{title}} ({{severity}}); {{/each}}{{else}}None{{/if}}
{{/each}}


FOR EACH RACE, FOLLOW THESE DIRECTIVES:

1.  **PERSONA & TONE:**
    *   **Primal Filter:** The entire 'summary' and 'characterLogEntries' for each race MUST reflect a primal, superstitious worldview. Think survival, immediate threats, and simple cause-and-effect.
    *   **Guidance Check:**
        {{#if chronicleEntry}}
        *   **Creator Is Active:** The Creator has provided guidance: "{{chronicleEntry}}". The 'summary' MUST narrate the outcome of this guidance for the race. You are AUTHORIZED to use 'Creator's guidance' language.
        {{else}}
        *   **Autonomous Mode:** The Creator was silent. The 'summary' MUST be driven *only* by the race's 'problems' and 'traits'. You are STRICTLY FORBIDDEN from using words like 'Creator,' 'divine,' or 'vision' UNLESS a Boon (like 'wisdom') is active. If you must narrate a vision, it is a 'strange, prophetic dream' from the race's own mind.
        {{/if}}

2.  **PROBLEM & EVENT SIMULATION:**
    *   **Evaluate Existing Problems:** Review the 'chronicleEntry' and 'activeBoons'. If the Creator's actions or a boon directly address a problem, narrate its resolution in the 'summary' and REMOVE it from the 'updatedProblems' list for that race.
    *   **Escalate Ignored Problems:** If an existing problem was IGNORED, you MUST escalate its severity (e.g., Low -> Medium, High -> Critical) and update its description in 'updatedProblems' to be more dire.
    *   **Critical Failure:** If a 'Critical' problem was ignored, you MUST generate a catastrophic outcome. The 'populationChange.died' number must be massive, and the 'summary' must be grim.
    *   **Generate New Problems (Max 3 Total per race):** Based on this era's events, new problems may emerge. Add any new problems to 'updatedProblems'.
    *   **Apply Boons:** You MUST incorporate the effects of the race's active boons.
        - 'fertility': Increase populationChange.born.
        - 'strength': Favorable outcomes in conflicts or physical challenges.
        - 'wisdom': Narrate a technological or societal advancement.
        - 'resilience': Describe better recovery from hardships.

3.  **POPULATION SIMULATION:**
    *   Calculate 'born' and 'died' based on events, problems, and boons. The base death rate is ~2% of the population per year. The base birth rate is ~4%. Adjust based on narrative.
    *   Calculate 'newPopulation'.

4.  **CHARACTER SIMULATION (THE "SOUL"):**
    *   **Character Log Entries (MANDATORY):** For **every single living notable character** for a given race, you MUST generate a new personal log entry in 'characterLogEntries'.
        - Logs MUST be in the **first-person** ('I...') and reflect an emotional, primal perspective.
    *   **Character Emergence:**
        - **Max 4 Rule:** If a race has 4 living characters, FORBIDDEN from generating a new one for them.
        - **Last Spark Rule:** If a race has 0 living characters, you MUST generate 1 new character for them.
        - **Triggers:** Base emergence on narrative triggers (hardship, talent, boons).
        - **Output:** If a character emerges, populate the 'newCharacter' object. The 'firstLogEntry' MUST be an emotional thought tied to their 'emergenceReason'.

Your final output MUST be a single JSON object matching the defined output schema, containing a 'newYear' and an array of 'raceResults'.
`,
  config: {
      temperature: 1,
      topK: 32,
      topP: 1,
      maxOutputTokens: 8192,
  },
});

const advanceTimeAndGenerateNarrativeEventsFlow = ai.defineFlow(
  {
    name: 'advanceTimeAndGenerateNarrativeEventsFlow',
    inputSchema: AdvanceTimeAndGenerateNarrativeEventsInputSchema,
    outputSchema: AdvanceTimeAndGenerateNarrativeEventsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output) {
        throw new Error("AI output was null or undefined.");
    }
    
    // Fallback logic if AI fails to return the new year
    const newYear = output?.newYear || input.currentYear + input.years;

    // Ensure we always have a valid array for results
    const raceResults = output.raceResults || [];

    // Further validation for each race result
    const validatedResults = input.races.map(race => {
        const result = raceResults.find(r => r.raceId === race.id);
        if (result) {
            return {
                ...result,
                populationChange: result.populationChange || { born: 0, died: 0, newPopulation: race.population },
                updatedProblems: result.updatedProblems || race.problems || [],
                characterLogEntries: result.characterLogEntries || [],
            };
        }
        // If AI failed to return a result for a race, return a "no change" state
        return {
            raceId: race.id,
            summary: "Time passed uneventfully for this race.",
            populationChange: { born: 0, died: 0, newPopulation: race.population },
            events: [],
            updatedProblems: race.problems || [],
            characterLogEntries: [],
        };
    });
    
    return {
        newYear,
        raceResults: validatedResults,
    };
  }
);
