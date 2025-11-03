import {genkit, configureGenkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import Handlebars from 'handlebars';

// For 'unless (eq ...)'
const eqHelper = (a: any, b: any) => a === b;
Handlebars.registerHelper('eq', eqHelper);

// For 'ne' (not equal)
const neHelper = (a: any, b: any) => a !== b;
Handlebars.registerHelper('ne', neHelper);

// For 'notequal'
const notequalHelper = (a: any, b: any, options: any) => {
  if (a !== b) return options.fn(this);
  return options.inverse(this);
};
Handlebars.registerHelper('notequal', notequalHelper);

// For 'join' (e.g., joining traits)
const joinHelper = (array: any, separator: string) => {
  if (!Array.isArray(array)) return array;
  if (typeof separator !== 'string') separator = ', ';
  return array.join(separator);
};
Handlebars.registerHelper('join', joinHelper);

// For checking if chronicle is empty
const isGuidanceProvided = (entry: string | null | undefined) => {
  return entry && entry.trim() !== '' && !entry.includes('The world of');
};
Handlebars.registerHelper('isGuidanceProvided', isGuidanceProvided);

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: 'googleai/gemini-2.5-pro',
});
