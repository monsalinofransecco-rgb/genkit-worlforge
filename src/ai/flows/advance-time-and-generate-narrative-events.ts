'use server';

/**
 * @fileOverview Advances time in the simulation and generates narrative events.
 *
 * - advanceTimeAndGenerateNarrativeEvents - A function that advances time and generates narrative events.
 * - AdvanceTimeAndGenerateNarrativeEventsInput - The input type for the advanceTimeAndGenerateNarrativeEvents function.
 * - AdvanceTimeAndGenerateNarrativeEventsOutput - The return type for the advanceTimeAndGenerateNarrativeEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProblemSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical', 'Catastrophic']),
});

const AdvanceTimeAndGenerateNarrativeEventsInputSchema = z.object({
  years: z.number().describe('The number of years to advance time by (1 or 10).'),
  worldName: z.string().describe('The name of the world.'),
  currentYear: z.number().describe('The current year in the world.'),
  raceCount: z.number().describe('The current number of races in the world.'),
  population: z.number().describe('The current population in the world.'),
  significantEvents: z.string().describe('A summary of significant events that have occurred in the world.'),
  boons: z.string().describe('A comma-separated list of active boons affecting the world (e.g., "fertility,strength").'),
  cataclysmPreparations: z.string().describe('A summary of preparations for potential cataclysm events.'),
  problems: z.array(ProblemSchema).optional().describe('A list of current problems the race is facing.'),
  chronicleEntry: z.string().optional().describe('A user-written chronicle entry to influence events.'),
});
export type AdvanceTimeAndGenerateNarrativeEventsInput = z.infer<typeof AdvanceTimeAndGenerateNarrativeEventsInputSchema>;

const AdvanceTimeAndGenerateNarrativeEventsOutputSchema = z.object({
  narrativeEvents: z.string().describe('A description of narrative events that occurred during the time period.'),
  populationChanges: z.string().describe('A description of population changes that occurred during the time period.'),
  characterLifecycleUpdates: z.string().describe('A description of character lifecycle updates that occurred during the time period.'),
  problemSimulations: z.string().describe('A description of how existing problems evolved or were resolved, and if any new problems emerged.'),
  societalEvolutions: z.string().describe('A description of societal evolutions that occurred during the time period.'),
  geographicalDiscoveries: z.string().describe('A description of geographical discoveries that occurred during the time period.'),
  newYear: z.number().describe('The new current year in the world.'),
  updatedProblems: z.array(ProblemSchema).optional().describe('The updated list of problems after the time advance.'),
});
export type AdvanceTimeAndGenerateNarrativeEventsOutput = z.infer<typeof AdvanceTimeAndGenerateNarrativeEventsOutputSchema>;

export async function advanceTimeAndGenerateNarrativeEvents(input: AdvanceTimeAndGenerateNarrativeEventsInput): Promise<AdvanceTimeAndGenerateNarrativeEventsOutput> {
  return advanceTimeAndGenerateNarrativeEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advanceTimeAndGenerateNarrativeEventsPrompt',
  input: {schema: AdvanceTimeAndGenerateNarrativeEventsInputSchema},
  output: {schema: AdvanceTimeAndGenerateNarrativeEventsOutputSchema},
  prompt: `You are a world simulator. You are simulating the world of {{{worldName}}}.

The current year is {{{currentYear}}}.
The number of races in the world is {{{raceCount}}}.
The current population is {{{population}}}.

Significant events that have occurred in the world:
{{{significantEvents}}}

**PLAYER INFLUENCE:**
- Active Boons: {{{boons}}}
- Creator's Chronicle Entry: {{{chronicleEntry}}}

**EXISTING PROBLEMS:**
{{#if problems}}
{{#each problems}}
- {{title}} (Severity: {{severity}}): {{description}}
{{/each}}
{{else}}
- No pressing problems at this time.
{{/if}}

**SIMULATION DIRECTIVES:**
1.  **ADVANCE TIME:** Advance time by {{{years}}} years.
2.  **EVALUATE PROBLEMS:**
    - **Check for Resolution:** Analyze the 'Creator's Chronicle Entry' and 'Active Boons'. If they directly address an existing problem, narrate its resolution in 'problemSimulations' and REMOVE it from the 'updatedProblems' list.
    - **Check for Escalation:** If an existing problem was IGNORED, you MUST escalate its severity (e.g., Low -> Medium, High -> Critical) and update its description to be more dire. The updated problem MUST be in the 'updatedProblems' list.
    - **CRITICAL FAILURE:** If a 'Critical' problem was ignored, you MUST generate a catastrophic outcome. The 'populationChanges' must reflect a massive death toll, and the 'problemSimulations' narrative must be grim.
3.  **GENERATE NEW PROBLEMS:** Based on the narrative events of this period, new problems may emerge. A booming population could cause "Resource Strain (Low)". A discovery could lead to "Unexpected Consequences (Medium)". Add any new problems to the 'updatedProblems' list (max 3 total problems).
4.  **APPLY BOONS:** You MUST analyze the active boons and apply their effects.
    - 'fertility': Apply a positive bias to population growth.
    - 'strength': Ensure favorable outcomes in conflicts.
    - 'wisdom': Generate a technological or societal advancement.
    - 'resilience': Describe better recovery from hardships.
5.  **NARRATE OUTPUT:** Generate descriptions for narrativeEvents, populationChanges, characterLifecycleUpdates, problemSimulations, societalEvolutions, and geographicalDiscoveries. Ensure the 'problemSimulations' field specifically details the evolution of problems.

Output the new year and all narrative fields in the appropriate output fields. The 'updatedProblems' field must contain the complete, final list of all active problems.
`,
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
    
    // Ensure output is not null
    if (!output) {
        throw new Error("AI output was null or undefined.");
    }

    return {
        ...output,
        newYear,
    };
  }
);
