'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Race, NotableCharacter, PersonalLogEntry } from '@/types/world';
import { BookText, Calendar, TrendingDown, TrendingUp, Users, UserPlus, BookOpen } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';


type TabProps = {
  race: Race;
};

// Helper to get all personal logs for a specific year from all characters
const getLogsForYear = (characters: NotableCharacter[], year: number): PersonalLogEntry[] => {
    const logs: PersonalLogEntry[] = [];
    characters.forEach(character => {
        character.personalLog.forEach(log => {
            if (log.year === year) {
                logs.push({ ...log, characterName: character.name });
            }
        });
    });
    return logs;
};


export function HistoryTab({ race }: TabProps) {
  const historyEntries = [...(race.history || [])].reverse().filter(entry => entry.year > 1);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <BookText className="mr-2" /> Race History
        </CardTitle>
        <CardDescription>The recorded annals of the {race.name}'s journey through time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[700px] pr-4">
          <div className="relative pl-6">
            {/* Timeline Line */}
            <div className="absolute left-0 top-0 h-full w-0.5 bg-border" />
            
            <div className="space-y-8">
              {historyEntries.length > 0 ? historyEntries.map((entry, index) => {
                const personalLogsForThisYear = getLogsForYear(race.notableCharacters, entry.year);
                return (
                  <div key={index} className="relative">
                    <div className="absolute -left-9 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-headline text-2xl text-primary mb-2">YEAR {entry.year}</h3>
                      
                      {/* Summary */}
                      <p className="italic text-muted-foreground mb-4">"{entry.summary}"</p>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-4">
                         <div className="flex items-center gap-2 text-green-400">
                           <TrendingUp className="h-4 w-4" />
                           <span>Born: {entry.populationChange.born.toLocaleString()}</span>
                         </div>
                         <div className="flex items-center gap-2 text-red-400">
                           <TrendingDown className="h-4 w-4" />
                           <span>Died: {entry.populationChange.died.toLocaleString()}</span>
                         </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                           <Users className="h-4 w-4" />
                           <span>New Population: {entry.populationChange.newPopulation.toLocaleString()}</span>
                         </div>
                      </div>

                      {/* Notable Events */}
                      {entry.events && entry.events.length > 0 && (
                        <div className="mb-4">
                           <h4 className="font-semibold text-foreground/90 mb-1">Notable Events</h4>
                           <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {entry.events.map((event, i) => <li key={i}>{event}</li>)}
                           </ul>
                        </div>
                      )}

                       {/* Character Emergence */}
                      {entry.emergenceReason && (
                        <div className="mb-4 p-3 rounded-md bg-card border-l-4 border-accent">
                          <h4 className="font-semibold flex items-center gap-2 mb-1"><UserPlus className="h-4 w-4" />Character Emergence</h4>
                          <p className="text-sm text-muted-foreground">{entry.emergenceReason}</p>
                        </div>
                      )}

                       {/* Personal Logs */}
                      {personalLogsForThisYear.length > 0 && (
                        <div className='mt-6'>
                            <h4 className="font-semibold flex items-center gap-2 mb-3"><BookOpen className="h-4 w-4" />Personal Logs (Year {entry.year})</h4>
                            <div className='space-y-3'>
                                {personalLogsForThisYear.map((log, i) => (
                                     <div key={i} className='pl-4 border-l-2 border-border text-sm'>
                                        <p className='italic text-muted-foreground'>"{log.entry}"</p>
                                        <p className='text-right text-foreground/80 font-medium'>- {log.characterName}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                      )}

                    </div>
                  </div>
                )
              }) : (
                 <div className="text-center text-muted-foreground py-20">
                    <p>The annals of history are still empty.</p>
                    <p className="text-sm">Advance time to begin writing the story of the {race.name}.</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
