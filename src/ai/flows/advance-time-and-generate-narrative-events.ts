
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'zod';
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

const DeathDetailsSchema = z.object({
    reason: z.string().describe("The cause of death, tied to the era's events."),
    favoriteThing: z.string().describe("Something simple the character cherished in life."),
    happiestMemory: z.string().describe("The character's fondest memory."),
    lastThought: z.string().describe("The character's final thought, written as a short, italicized quote.")
});

const FallenNotableCharacterSchema = z.object({
    characterId: z.string().describe("The ID of the notable character who has died."),
    deathDetails: DeathDetailsSchema.describe("The detailed, emotional epitaph for the character."),
});

const NamedCommonerDeathSchema = z.object({
    name: z.string().describe("A new, culturally-appropriate name for the deceased commoner."),
    title: z.string().describe("A simple title for the commoner (e.g., 'a young hunter', 'an old farmer')."),
    ageAtDeath: z.number().describe("The age at which the commoner died."),
    deathDetails: DeathDetailsSchema.describe("The detailed, emotional epitaph for the commoner.")
});

const DetailObjectSchema = z.object({
    name: z.string().describe("The new name for the system (e.g., 'Militaristic', 'Hoarding')."),
    description: z.string().describe("A description of the new system, reflecting the events that caused it.")
});

const SocietalLogEntrySchema = z.object({
    eventName: z.string().describe("The name of the event that triggered the shift (e.g., 'The Decade of Scarcity')."),
    summary: z.string().describe("A summary of what happened and why it changed the society.")
});
const AchievementSchema = z.object({
    id: z.string().describe("A unique ID for this achievement, e.g., 'discovered_fire'."),
    title: z.string().describe("The name of the achievement, e.g., 'The Gift of Fire'."),
    description: z.string().describe("A 1-sentence description of what happened."),
    rpAward: z.number().describe("The amount of RP to award the race.")
  });
  
  const BoonDirectiveSchema = z.object({
    id: z.string().describe("A unique ID for this directive."),
    boonId: z.string().describe("e.g., 'appear_in_dreams'"),
    targets: z.array(z.string()).describe("e.g., ['CharacterID-1'] or ['CharacterID-1', 'CharacterID-2']"),
    content: z.string().describe("e.g., 'The mountain will bleed...'")
  });

const MapTileSchema = z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    biome: z.string(),
    resources: z.array(z.string()),
});

// Schemas for the main flow
const ProblemSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical', 'Catastrophic']),
});

const NamingProfileSchema = z.object({
    phonemes: z.string(),
    inspiration: z.string(),
    languageStructure: z.string(),
});

const RaceSimulationInputSchema = z.object({
    id: z.string(),
    name: z.string(),
    population: z.number(),
    traits: z.string().describe("Comma-separated list of the race's core traits, e.g., 'Hardy, Industrious'"),
    culture: DetailObjectSchema,
    government: DetailObjectSchema,
    religion: DetailObjectSchema,
    livingCharacters: z.array(LivingCharacterSchema).describe("A list of all currently living notable characters for this race."),
    problems: z.array(ProblemSchema).optional().describe('A list of current problems the race is facing.'),
    boons: z.record(z.boolean()).describe("An object with boon IDs as keys and true/false as values, e.g., { 'fertility': true }."),
    occupiedTiles: z.array(z.string()),
    knownTiles: z.array(z.string()),
    technologies: z.array(z.string()),
    namingProfile: NamingProfileSchema.optional(),
    existingNames: z.array(z.string()).describe("A list of all names currently or previously used by this race to ensure new names are unique."),
});

const AdvanceTimeAndGenerateNarrativeEventsInputSchema = z.object({
  years: z.number().describe('The number of years to advance time by (1 or 10).'),
  worldName: z.string().describe('The name of the world.'),
  era: z.string().describe('The current era of the world (e.g., "Primal Era").'),
  currentYear: z.number().describe('The current year in the world.'),
  races: z.array(RaceSimulationInputSchema).describe("An array of all races to be simulated."),
  chronicleEntry: z.string().optional().describe('The latest user-written chronicle entry to influence events.'),
  boonDirectives: z.array(BoonDirectiveSchema).optional().describe("An array of specific, targeted boon directives from the Creator."),
  worldMap: z.array(MapTileSchema).describe("The complete world map grid."),
});
export type AdvanceTimeAndGenerateNarrativeEventsInput = z.infer<typeof AdvanceTimeAndGenerateNarrativeEventsInputSchema>;

const RaceSimulationResultSchema = z.object({
    raceId: z.string().describe("The ID of the race that was simulated."),
    summary: z.string().describe("A 3rd person, 'historian' voice summary of the main events, successes, and failures for this race during the era. This MUST be written from a PRIMAL, SIMPLE, and SUPERSTITIOUS perspective. It MUST mention the total number of deaths and name one or two significant fallen individuals."),
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
    fallenNotableCharacters: z.array(FallenNotableCharacterSchema).optional().describe("A list of existing notable characters who died this era."),
    namedCommonerDeaths: z.array(NamedCommonerDeathSchema).max(3).optional().describe("A list of 2-3 newly named commoners who died this era to give a face to the death toll."),
    newCulture: DetailObjectSchema.optional().describe("If the culture shifted THIS ERA, provide the NEW complete culture object here."),
    newCultureLogEntry: SocietalLogEntrySchema.optional().describe("If culture changed, you MUST provide a log entry (eventName, summary) explaining what happened and why."),
    newGovernment: DetailObjectSchema.optional().describe("If the government changed THIS ERA, provide the NEW complete government object here."),
    newReligion: DetailObjectSchema.optional().describe("If the religion changed THIS ERA, provide the NEW complete religion object here."),
    newPoliticLogEntry: SocietalLogEntrySchema.optional().describe("If religion OR government changed, you MUST provide a log entry (eventName, summary) explaining what happened and why."),
    newAchievements: z.array(AchievementSchema).optional().describe("A list of new, major achievements unlocked by this race THIS ERA. Do not grant achievements they have already earned."),
    updatedOccupiedTiles: z.array(z.string()).describe("The new list of all tiles this race occupies."),
    updatedKnownTiles: z.array(z.string()).describe("The complete list of all tiles this race is aware of (Fog of War)."),
    newTechnologies: z.array(z.string()).optional().describe("Any new technologies discovered, e.g., 'Sailing'."),
    newSettlement: z.string().optional().describe("If the race establishes a new primary settlement or moves, provide the new settlement's name here (e.g., 'Stonehaven', 'The Sunken City')."),
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
---
**MANDATORY PERSONA & CONTEXT**
---
You are a 'Primal Era' Simulator. The race you are simulating is in the **{{{era}}}**. Their status is 'Emerging.'

**THIS IS YOUR MOST IMPORTANT RULE:**
Your worldview, logic, and narrative **MUST** be **PRIMEVAL, SIMPLE, and SUPERSTITIOUS.**

* **THEIR GOALS:** Their only goals are:
    1.  **Survival:** Find food, find shelter, stay warm.
    2.  **Safety:** Avoid predators (beasts or other races).
    3.  **Understanding (Basic):** Create simple, superstitious explanations for natural events (e.g., "The sickness is an angry spirit," "The good harvest is a blessing from the mountain").

* **WHAT THEY ARE NOT:**
    * They are **NOT** philosophers.
    * They are **NOT** long-term strategic planners.
    * They are **NOT** economists.

* **FORBIDDEN CONCEPTS:** You are **FORBIDDEN** from generating narratives that involve:
    * Complex democracy, intricate laws, or formal "treaties."
    * The "scientific method" or advanced technical thought.
    * Complex economic systems, "long-term resource planning."
    * Deep philosophical or metaphysical introspection.

* **ALLOWED SOLUTIONS (PRIMAL):** When facing a problem, their solutions must be simple:
    * "Find a new cave."
    * "Follow the migrating herds."
    * "Make sharper sticks (spears)."
    * "Stockpile more nuts."
    * "Create a simple ritual to please the (perceived) angry spirit."

All of your outputs ('summary', 'newProblems', 'characterLogEntries') **MUST** reflect this simple, primal worldview.
---

You are simulating the world of {{{worldName}}}. It is year {{currentYear}}.
The Creator's guidance for this era: {{#if chronicleEntry}}"{{chronicleEntry}}"{{else}}None{{/if}}.
{{#if boonDirectives}}
ACTIVE CREATOR DIRECTIVES:
{{#each boonDirectives}}
  - Directive {{this.id}} (Type: {{this.boonId}}): Targets [{{#each this.targets}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}] - Content: "{{this.content}}"
{{/each}}
{{/if}}


RACES TO SIMULATE:
{{#each races}}
- Race: {{name}} (ID: {{id}})
  - Traits: {{traits}}
  - Occupied Tiles: {{#each occupiedTiles}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
  - Population: {{population}}
  - Culture: {{culture.name}}
  - Government: {{government.name}}
  - Religion: {{religion.name}}
  - Living Characters: {{livingCharacters.length}}
  - Active Boons: {{#if boons}}Yes{{else}}None{{/if}}
  - Existing Problems: {{#if problems}}{{#each problems}}{{title}} ({{severity}}); {{/each}}{{else}}None{{/if}}
{{/each}}

THE WORLD MAP:
The world is a grid. Here are all the tiles you need to know about:
{{#each worldMap}}
- Tile {{id}} ({{biome}}): Contains [{{#each resources}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}]
{{/each}}

FOR EACH RACE, FOLLOW THESE DIRECTIVES:

1.  **PERSONA & TONE:**
    * **Primal Filter:** The entire 'summary' and 'characterLogEntries' for each race MUST reflect a primal, superstitious worldview. Think survival, immediate threats, and simple cause-and-effect.
    * **Guidance Check:**
        {{#if chronicleEntry}}
        * **Creator Is Active:** The Creator has provided guidance: "{{chronicleEntry}}". The 'summary' MUST narrate the outcome of this guidance for the race. You are AUTHORIZED to use 'Creator's guidance' language.
        {{else}}
        * **Autonomous Mode:** The Creator was silent. The 'summary' MUST be driven *only* by the race's 'problems' and 'traits'. You are STRICTLY FORBIDDEN from using words like 'Creator,' 'divine,' or 'vision' UNLESS a Boon (like 'wisdom') is active. If you must narrate a vision, it is a 'strange, prophetic dream' from the race's own mind.
        {{/if}}

2.  **BOON INTEGRATION (MANDATORY):**
    You must check for active boons on the *current race you are simulating* and apply their effects.
    
    {{#if boons.pop_boom_1}}
    - **Boon Active: Boon of Fertility.** You MUST apply a positive bias to the 'populationChange.born' statistic and narrate this in the 'summary'.
    {{/if}}
    {{#if boons.great_leader}}
    - **Boon Active: Boon of Heroism.** You MUST generate one 'newCharacter'.
    {{/if}}
    {{#if boons.inno_burst_1}}
    - **Boon Active: Boon of Discovery.** You MUST generate a notableEvent for a primal discovery.
    {{/if}}
    {{#if boons.gov_reform}}
    - **Boon Active: Governmental Reform.** You MUST generate a 'newGovernment' object and a 'newPoliticLogEntry'.
    {{/if}}
    

3.  **PROBLEM & EVENT SIMULATION:**
    * Evaluate 'chronicleEntry' and 'activeBoons'. If they solve a problem, resolve it in the 'summary' and REMOVE it from 'updatedProblems'.
    * If a problem was IGNORED, ESCALATE its severity in 'updatedProblems'.
    * If a 'Critical' problem was ignored, generate a CATASTROPHIC outcome with a massive 'populationChange.died' number.
    * Generate new problems (max 3 total per race) based on events.
    * Apply Boon effects (beyond the mandatory list): 'strength' (better conflict outcomes), 'wisdom' (advancement), 'resilience' (better recovery).

4.  **DEATH SIMULATION (THE "SOUL"):**
    * **Notable Deaths:** Review the 'livingCharacters'. Determine if any should die from old age, sickness, or events. If so, you MUST generate a 'fallenNotableCharacters' entry for them. You MUST write their detailed, emotional 'deathDetails' (reason, favoriteThing, happiestMemory, lastThought).
    * **Commoner Deaths:** Look at your 'populationChange.died' statistic. To make this number feel real, you MUST "promote" **2-3** of these anonymous deaths into named entries for the 'namedCommonerDeaths' array. **Do not exceed 3.**
        * For each, invent a new, culturally-appropriate 'name' **using the NAMING PROFILE**.
        * Give them a simple 'title' (e.g., 'a young hunter,' 'an old farmer,' 'a brave mother').
        * The 'deathDetails.reason' for these commoners MUST be tied to the era's 'summary' or 'events'.
        * You MUST write their full, emotionally-tugging 'deathDetails'.

5.  **CULTURE, GOVERNMENT, & RELIGION SIMULATION (SLOW SYSTEMS):**
    * These systems change RARELY. Do NOT change them every year.
    * Ask: "Did a MAJOR event happen that would fundamentally change how this society works or what it believes?" (e.g., discovery of a new resource, a great war, a new leader, a cataclysm).
    * **If YES:** A major event occurred.
        * **Culture:** If appropriate, generate a 'newCulture' object (e.g., name: "Militaristic"). You MUST also generate a corresponding 'newCultureLogEntry' to explain the change.
        * **Government/Religion:** If appropriate, generate 'newGovernment' and/or 'newReligion' objects. If either changes, you MUST generate a 'newPoliticLogEntry' explaining the shift (e.g., eventName: "The Elder's Accord", summary: "After the war, the tribe formed a council of elders...").
    * **If NO:** Do not generate any new culture, government, or religion objects or log entries. They remain the same.

6.  **POPULATION & CHARACTER SIMULATION:**
    * Calculate 'born' and 'died' based on events. Base death rate is ~2% of population per year, base birth rate is ~4%. Adjust based on narrative.
    * Calculate 'newPopulation'.
    * **Character Log Entries (MANDATORY):** For **every single living notable character** provided in the input, you MUST generate a new, unique, first-person ('I...') personal log entry reflecting on the events of THIS era. DO NOT repeat their previous log entries.
    * **Character Emergence:**
        * **Max 4 Rule:** If a race has 4 living characters, FORBIDDEN from generating a new one.
        * **Last Spark Rule:** If a race has 0 living characters, you MUST generate 1 new character.
        * Base emergence on narrative triggers (hardship, talent, boons).
        * If a character emerges, populate 'newCharacter'. The character's 'name' **MUST** be generated using the NAMING PROFILE. The 'firstLogEntry' MUST be an emotional thought tied to their 'emergenceReason'.
7.  **FINAL SUMMARY:**
    * When you write the main 'summary', you MUST include the total 'died' statistic (e.g., "...claimed 31 lives...").
    * You MUST also mention by name **one or two** of the most significant deaths you just generated (from 'fallenNotableCharacters' or 'namedCommonerDeaths').
    
8.  **TARGETED DIRECTIVES (MANDATORY):**
You must check the 'ACTIVE CREATOR DIRECTIVES' list from the input. If directives exist for the race you are simulating, you MUST execute them by interpreting the 'boonId' and 'content' for the specified 'targets'. For example:
{{#each boonDirectives}}
- **Directive for {{this.boonId}}:** Targets {{#each this.targets}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}. Content: "{{this.content}}". You MUST implement this.
{{/each}}


9.  **ACHIEVEMENT GENERATION (MANDATORY):**
    You must review this race's 'events' list that you just generated. If a major, "first-time" milestone occurred, you **MUST** generate a 'newAchievement' object for it.
    * "The Gift of Fire" (Discovery of fire): 50 RP
    * "First Tamed Beast" (First domesticated animal): 75 RP
    * "The Elder's Accord" (First formal government): 100 RP
    * "First Contact" (First meeting with another race): 25 RP
    * "The First War" (First major conflict with another race): 100 RP
    * "The First Song" (First evidence of art/culture): 25 RP

10. **EXPLORATION, EXPANSION, & TECHNOLOGY (MANDATORY):**
    * Review the race's 'occupiedTiles' and 'knownTiles'.
    * If the race has a "Curious" or "Expansionist" trait, or a 'great_leader' boon, they will try to explore or expand.
    * **Expansion:** They can only expand to **adjacent, habitable tiles** (e.g., 'Plains', 'Forest'). Add the new tile to 'updatedOccupiedTiles'. If they establish a major new home, you **MUST** provide a 'newSettlement' name.
    * **Exploration:** When they expand, they "discover" all adjacent tiles. Add these new tile IDs to 'updatedKnownTiles'.
    * **TECHNOLOGY (Your "Development" rule):**
        * A race **CANNOT** cross an 'Ocean' tile unless their 'technologies' list includes 'Sailing'.
        * A race **CANNOT** easily expand into 'Mountains' unless they have 'Mountaineering'.
        * If a race is next to an 'Ocean' for a long time, you **MUST** generate a 'notableEvent' for them discovering 'Basic Sailing' and add it to 'newTechnologies'.

11. **FIRST CONTACT PROTOCOL (CRITICAL):**
    * While exploring, if a race moves into a tile that is already on another race's 'occupiedTiles' list (check the input), this is a **"First Contact"** event.
    * You **MUST** generate a major 'notableEvent' for *both* races involved.
    * The outcome of the First Contact **MUST** be logical. Base it on the traits of *both* races (e.g., "Hardy, Industrious" meeting "Mystical, Xenophobic" will be tense).
    * The races now share 'knownTiles' for all adjacent territories.
12. **NAMING CONVENTION (CRITICAL):**
    When you are required to generate a name for a 'newCharacter' or a 'namedCommonerDeath', you MUST use the provided 'namingProfile' for that race. The names must be unique and consistent with the cultural and linguistic rules described in the profile. **YOU MUST NOT REPEAT ANY NAME FROM THE 'existingNames' LIST.**

Your final output MUST be a single JSON object matching the defined output schema, containing a 'newYear' and an array of 'raceResults'.

The Creator's guidance for this era: {{#if chronicleEntry}}"{{chronicleEntry}}"{{else}}None{{/if}}.
{{#if boonDirectives}}
ACTIVE CREATOR DIRECTIVES:
{{#each boonDirectives}}
  - Directive {{this.id}} (Type: {{this.boonId}}): Targets [{{#each this.targets}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}] - Content: "{{this.content}}"
{{/each}}
{{/if}}
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
    
    const newYear = output?.newYear || input.currentYear + input.years;
    const raceResults = output.raceResults || [];

    const validatedResults = input.races.map(race => {
        const result = raceResults.find(r => r.raceId === race.id);
        if (result) {
            return {
                ...result,
                populationChange: result.populationChange || { born: 0, died: 0, newPopulation: race.population },
                updatedProblems: result.updatedProblems || race.problems || [],
                characterLogEntries: result.characterLogEntries || [],
                fallenNotableCharacters: result.fallenNotableCharacters || [],
                namedCommonerDeaths: result.namedCommonerDeaths || [],
                updatedOccupiedTiles: result.updatedOccupiedTiles || race.occupiedTiles,
                updatedKnownTiles: result.updatedKnownTiles || race.knownTiles,
                newTechnologies: result.newTechnologies || [],
            };
        }
        return {
            raceId: race.id,
            summary: "Time passed uneventfully for this race.",
            populationChange: { born: 0, died: 0, newPopulation: race.population },
            events: [],
            updatedProblems: race.problems || [],
            characterLogEntries: [],
            fallenNotableCharacters: [],
            namedCommonerDeaths: [],
            updatedOccupiedTiles: race.occupiedTiles,
            updatedKnownTiles: race.knownTiles,
            newTechnologies: [],
        };
    });
    
    return {
        newYear,
        raceResults: validatedResults,
    };
  }
);

    

    