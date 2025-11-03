'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Race } from '@/types/world';
import { Skull } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

type TabProps = {
  race: Race;
};

export function GraveyardTab({ race }: TabProps) {
    const deadCharacters = race.notableCharacters.filter(c => c.status === 'dead');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Skull className="mr-2" /> Graveyard
        </CardTitle>
        <CardDescription>
          A memorial to the notable figures who have passed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[700px] pr-4">
            {deadCharacters.length > 0 ? (
                 <div className='grid md:grid-cols-2 gap-4'>
                    {deadCharacters.map(character => (
                        <Card key={character.id} className="bg-card/50 opacity-80">
                            <CardHeader>
                                <CardTitle className='text-xl font-headline'>{character.name}</CardTitle>
                                <CardDescription>Died in Year {character.deathYear} at age {character.age}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm italic text-muted-foreground'>"{character.deathNarrative || 'No final words were recorded.'}"</p>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className='flex flex-col items-center justify-center text-center py-16 text-muted-foreground h-96'>
                    <Skull className="w-16 h-16 mb-4" />
                    <p>The graveyard is currently empty for this race.</p>
                    <p className='text-sm'>No notable figures have fallen... yet.</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
