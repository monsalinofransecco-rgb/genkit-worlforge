'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World, NotableCharacter } from '@/types/world';
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
  world: World;
  setWorld: (world: World) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  activeRaceId: string;
};

export function CharactersTab({
  world,
  setWorld,
  isLoading,
  setIsLoading,
  activeRaceId,
}: TabProps) {
  const { toast } = useToast();

  const handleSimulateDeaths = async () => {
    const race = world.races.find((r) => r.id === activeRaceId);
    const characters = world.notableCharacters.filter(
      (c) => c.raceId === activeRaceId && c.status === 'alive'
    );
    if (!race || characters.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No living notable characters for this race.',
      });
      return;
    }

    setIsLoading(true);
    const result = await runSimulateNotableCharacterDeaths({
      notableCharacterNames: characters.map((c) => c.name),
      reasonForDeaths: 'Old age, sickness, or misfortune.',
      currentYear: world.currentYear,
      raceName: race.name,
    });
    setIsLoading(false);

    if (result.success && result.data) {
      const { deathNarratives, commonerDeathToll, impactfulQuote } =
        result.data;

      const updatedCharacters = world.notableCharacters.map((c) => {
        if (characters.find((char) => char.id === c.id)) {
          const narrative =
            deathNarratives.find((n) => n.includes(c.name)) ||
            'Died of old age.';
          return {
            ...c,
            status: 'dead',
            deathYear: world.currentYear,
            deathNarrative: narrative,
          };
        }
        return c;
      });

      const newLogEntries = [
        ...deathNarratives.map((n) => ({
          year: world.currentYear,
          type: 'death' as const,
          content: n,
        })),
        {
          year: world.currentYear,
          type: 'death' as const,
          content: `${commonerDeathToll.toLocaleString()} commoners also perished.`,
        },
        {
          year: world.currentYear,
          type: 'death' as const,
          content: `A reflection on the loss: "${impactfulQuote}"`,
        },
      ].filter(
        (entry) =>
          entry.content &&
          entry.content.trim() !== '' &&
          !entry.content.toLowerCase().includes('n/a')
      );

      setWorld({
        ...world,
        notableCharacters: updatedCharacters,
        narrativeLog: [...world.narrativeLog, ...newLogEntries],
      });

      toast({
        title: "Characters' Fates Sealed",
        description: 'The annals of history have been updated.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error Simulating Deaths',
        description: result.error,
      });
    }
  };

  const livingCharacters = world.notableCharacters.filter(
    (c) => c.raceId === activeRaceId && c.status === 'alive'
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
        <Button
          onClick={handleSimulateDeaths}
          disabled={isLoading || livingCharacters.length === 0}
          size="sm"
          variant="destructive"
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Skull size={16} className="mr-2" />
          )}
          Simulate Passing of the Guard
        </Button>
        <ScrollArea className="h-96 pr-4">
          {livingCharacters.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {livingCharacters.map((character) => (
                <Card key={character.id} className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="font-headline text-primary">
                      {character.name}
                    </CardTitle>
                    <CardDescription>
                      {character.deathNarrative || 'An emerging figure.'} | Age: Unknown | Class: Unknown
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                        <h4 className='flex items-center text-sm font-semibold mb-2'><Target className='mr-2 h-4 w-4'/> Ambition</h4>
                        <Badge>Unknown</Badge>
                    </div>
                     <div>
                        <h4 className='flex items-center text-sm font-semibold mb-2'><Sparkles className='mr-2 h-4 w-4'/> Common Traits</h4>
                        <div className='flex flex-wrap gap-1'>
                            <Badge variant="secondary">Unknown</Badge>
                        </div>
                    </div>
                     <div>
                        <h4 className='flex items-center text-sm font-semibold mb-2'><Bolt className='mr-2 h-4 w-4'/> Skills</h4>
                         <div className='flex flex-wrap gap-1'>
                            <Badge variant="outline">Unknown</Badge>
                        </div>
                    </div>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="log">
                        <AccordionTrigger className='text-sm'>
                            <BookOpen className='mr-2 h-4 w-4'/> View Personal Log
                        </AccordionTrigger>
                        <AccordionContent>
                            <p className='text-xs text-muted-foreground italic'>No log entries yet.</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
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
