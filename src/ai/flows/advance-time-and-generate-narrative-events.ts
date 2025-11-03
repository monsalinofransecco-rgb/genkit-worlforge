
'use server';

/**
 * @fileOverview Advances time in the simulation and generates narrative events.
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

const AdvanceTimeAndGenerateNarrativeEventsInputSchema = z.object({
  years: z.number().describe('The number of years to advance time by (1 or 10).'),
  worldName: z.string().describe('The name of the world.'),
  era: z.string().describe('The current era of the world (e.g., "Primal Era").'),
  currentYear: z.number().describe('The current year in the world.'),
  race: z.object({
      id: z.string(),
      name: z.string(),
      population: z.number(),
      traits: z.string().describe("Comma-separated list of the race's core traits, e.g., 'Hardy, Industrious'"),
      location: z.string().describe("The race's primary location, e.g., 'Crystal Mountains'"),
      livingCharacters: z.array(LivingCharacterSchema).describe("A list of all currently living notable characters for this race."),
  }),
  problems: z.array(ProblemSchema).optional().describe('A list of current problems the race is facing.'),
  activeBoons: z.array(z.string()).describe("An array of active boon IDs, e.g., ['fertility', 'strength']."),
  chronicleEntry: z.string().optional().describe('The latest user-written chronicle entry to influence events.'),
});
export type AdvanceTimeAndGenerateNarrativeEventsInput = z.infer<typeof AdvanceTimeAndGenerateNarrativeEventsInputSchema>;


const AdvanceTimeAndGenerateNarrativeEventsOutputSchema = z.object({
    newYear: z.number().describe('The new current year in the world.'),
    summary: z.string().describe("A 3rd person, 'historian' voice summary of the main events, successes, and failures of the era. This MUST be written from a PRIMAL, SIMPLE, and SUPERSTITIOUS perspective."),
    populationChange: z.object({
        born: z.number().describe("Number of births during this period."),
        died: z.number().describe("Number of deaths during this period."),
        newPopulation: z.number().describe("The final population after births and deaths.")
    }),
    events: z.array(z.string()).describe("A bullet-point list of key notable events that occurred."),
    emergenceReason: z.string().optional().describe("If a new character emerged, a description of why they emerged. This is tied to their backstory."),
    updatedProblems: z.array(ProblemSchema).describe('The updated list of all active problems after the simulation.'),
    newCharacter: NewCharacterSchema.optional().describe("The full data for a new notable character, if one emerged this era."),
    characterLogEntries: z.array(CharacterLogEntrySchema).describe("An array of new personal log entries, one for EACH living character passed in the input."),
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

You are simulating the world of {{{worldName}}} for the {{race.name}} people. It is year {{currentYear}}.
The race's traits are: {{race.traits}}. Their location is: {{race.location}}. Their current population is {{race.population}}.

EXISTING PROBLEMS:
{{#if problems}}
  {{#each problems}}
  - {{title}} (Severity: {{severity}}): {{description}}
  {{/each}}
{{else}}
- No pressing problems.
{{/if}}

LIVING CHARACTERS ({{race.livingCharacters.length}} total):
{{#each race.livingCharacters}}
- {{name}} ({{title}}, Age {{age}})
{{/each}}

SIMULATION DIRECTIVES FOR ADVANCING TIME BY {{years}} YEARS:

1.  **PERSONA & TONE:**
    *   **Primal Filter:** Your entire output (summary, logs) must reflect a primal, superstitious worldview. Think survival, immediate threats, and simple cause-and-effect (e.g., "The river spirit is angry, causing floods").
    *   **Guidance Check:**
        {{#if (isGuidanceProvided chronicleEntry)}}
        *   **Creator Is Active:** The Creator has provided guidance: "{{chronicleEntry}}". Your 'summary' MUST narrate the outcome of this guidance. You are AUTHORIZED to use 'Creator's guidance' language.
        {{else}}
        *   **Autonomous Mode:** The Creator was silent. Your 'summary' MUST be driven *only* by the race's 'problems' and 'traits'. You are STRICTLY FORBIDDEN from using words like 'Creator,' 'divine,' or 'vision' UNLESS a Boon (like 'wisdom') is active. If you must narrate a vision, it is a 'strange, prophetic dream' from the race's own mind.
        {{/if}}

2.  **PROBLEM & EVENT SIMULATION:**
    *   **Evaluate Existing Problems:** Review the 'chronicleEntry' and 'activeBoons'. If the player's actions directly address a problem, narrate its resolution in the 'summary' and REMOVE it from the 'updatedProblems' list.
    *   **Escalate Ignored Problems:** If an existing problem was IGNORED, you MUST escalate its severity (e.g., Low -> Medium, High -> Critical) and update its description in 'updatedProblems' to be more dire.
    *   **Critical Failure:** If a 'Critical' problem was ignored, you MUST generate a catastrophic outcome. The 'populationChange.died' number must be massive, and the 'summary' must be grim.
    *   **Generate New Problems (Max 3 Total):** Based on this era's events, new problems may emerge as a logical consequence. A population boom could cause "Resource Strain (Low)". A discovery could lead to "Unexpected Sickness (Medium)". Add any new problems to 'updatedProblems'.
    *   **Apply Boons:** You MUST incorporate the effects of these active boons: {{#if activeBoons}}{{#each activeBoons}}'{{this}}' {{/each}}{{else}}None{{/if}}.
        - 'fertility': Increase populationChange.born.
        - 'strength': Favorable outcomes in conflicts or physical challenges.
        - 'wisdom': Narrate a technological or societal advancement (e.g., better tools, a new ritual).
        - 'resilience': Describe better recovery from hardships or problems.

3.  **POPULATION SIMULATION:**
    *   Calculate 'born' and 'died' based on the events, problems, and boons. The base death rate is ~2% of the population per year. The base birth rate is ~4%. Adjust these based on the narrative. A famine (died up), a fertility boon (born up).
    *   Calculate 'newPopulation'.

4.  **CHARACTER SIMULATION (THE "SOUL"):**
    *   **Character Log Entries (MANDATORY):** For **every single living notable character** provided in the input, you MUST generate a new personal log entry for them in the 'characterLogEntries' array. This is not optional.
        - The log MUST be in the **first-person** ('I...').
        - The log MUST be an **emotional reflection** of the era's 'summary' and 'events', filtered through their personal 'traits' and 'ambition'.
        - The log MUST be *Primal*. (e.g., "I fear the dark," "I am hungry," "The spirits are angry").
    *   **Character Emergence (The "How & Why"):**
        - **Max 4 Rule:** If there are already 4 living characters, you are FORBIDDEN from generating a new one.
        - **Last Spark Rule:** If there are 0 living characters, you MUST generate at least 1 new character.
        - **Triggers:** Base emergence on narrative triggers (hardship, rare talent, or a boon).
        - **'great_leader' Boon:** If 'strength' or 'wisdom' boon is active, you are encouraged to generate a new character.
        - **Output:** If a character emerges, fully populate the 'newCharacter' object.
            - Write the 'emergenceReason' explaining *why* they emerged (e.g., "As the tribe starved, a young hunter named Olen refused to give up...").
            - **First Log Entry (CRITICAL):** The 'firstLogEntry' MUST NOT be a generic placeholder. It MUST be the character's *first emotional thought*, directly tied to their 'emergenceReason'.
            - *(Example: (Reason: "Survived a plague") -> firstLogEntry: "The sickness took my family, but I survived. I will not be helpless. I will learn the secrets of the plants.")*

Your final output MUST be a single JSON object matching the defined output schema.
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
    
    // Fallback logic if AI fails to return the new year
    const newYear = output?.newYear || input.currentYear + input.years;
    
    if (!output) {
        throw new Error("AI output was null or undefined.");
    }

    // Ensure we always have a valid population change object
    const populationChange = output.populationChange || {
        born: 0,
        died: 0,
        newPopulation: input.race.population
    };
    
    // Ensure we always have an array for problems
    const updatedProblems = output.updatedProblems || input.problems || [];
    
    const characterLogEntries = output.characterLogEntries || [];

    return {
        ...output,
        newYear,
        populationChange,
        updatedProblems,
        characterLogEntries,
    };
  }
);
