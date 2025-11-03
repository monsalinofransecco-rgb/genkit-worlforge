'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World, NotableCharacter, Race } from '@/types/world';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { runSimulateNotableCharacterDeaths } from '@/app/actions';
import {
  Loader2,
  Users,
  UserX,
  Skull,
  Target,
  Sparkles,
  Bolt,
  Star,
  BookOpen,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type TabProps = {
  race: Race;
  setWorld: (world: World) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

export function CharactersTab({
  race,
  // setWorld and setIsLoading might be needed for future actions
}: TabProps) {
  const { toast } = useToast();

  const livingCharacters = race.notableCharacters.filter(
    (c) => c.status === 'alive'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Users className="mr-2" /> Notable Characters
        </CardTitle>
        <CardDescription>
          Individuals who have emerged to shape this race's history. New
          characters will arise on their own through the passage of time and
          events.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[700px] pr-4">
          {livingCharacters.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {livingCharacters.map((character) => (
                <Card key={character.id} className="bg-card flex flex-col">
                  <CardHeader>
                    <CardTitle className="font-headline text-primary">
                      {character.name}
                    </CardTitle>
                    <CardDescription>
                      {character.title} | Age: {character.age} | Class: {character.class}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-grow flex flex-col">
                    <div>
                        <h4 className='flex items-center text-sm font-semibold mb-2'><Target className='mr-2 h-4 w-4'/> Ambition</h4>
                        <Badge>{character.ambition}</Badge>
                    </div>
                     <div>
                        <h4 className='flex items-center text-sm font-semibold mb-2 mt-4'><Sparkles className='mr-2 h-4 w-4'/> Common Traits</h4>
                        <div className='flex flex-wrap gap-1'>
                            {character.traits.map(trait => <Badge key={trait} variant="secondary">{trait}</Badge>)}
                        </div>
                    </div>
                     <div>
                        <h4 className='flex items-center text-sm font-semibold mb-2 mt-4'><Bolt className='mr-2 h-4 w-4'/> Skills</h4>
                         <div className='flex flex-wrap gap-1'>
                            {character.skills.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                        </div>
                    </div>
                    {character.specialTraits.length > 0 && (
                        <div>
                            <h4 className='flex items-center text-sm font-semibold mb-2 mt-4'><Star className='mr-2 h-4 w-4'/> Special Traits</h4>
                            <div className='flex flex-wrap gap-1'>
                                {character.specialTraits.map(trait => <Badge key={trait} variant="default">{trait}</Badge>)}
                            </div>
                        </div>
                    )}
                    <div className="flex-grow" />
                    <Accordion type="single" collapsible className="w-full mt-4">
                      <AccordionItem value="log">
                        <AccordionTrigger className='text-sm'>
                            <BookOpen className='mr-2 h-4 w-4'/> View Personal Log
                        </AccordionTrigger>
                        <AccordionContent>
                            <ScrollArea className='h-32'>
                            {character.personalLog && character.personalLog.length > 0 ? (
                                [...character.personalLog].reverse().map(log => (
                                    <div key={log.year} className='text-xs text-muted-foreground italic border-l-2 pl-2 mb-2'>
                                        <span className='font-bold not-italic text-foreground/80'>Year {log.year}:</span>
                                        <p>"{log.entry}"</p>
                                    </div>
                                ))
                            ) : (
                                <p className='text-xs text-muted-foreground italic'>No log entries yet.</p>
                            )}
                            </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground h-96">
              <UserX className="w-16 h-16 mb-4" />
              <p>There are no living notable characters for this race.</p>
              <p className="text-sm">
                Advance time to see new figures emerge.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
