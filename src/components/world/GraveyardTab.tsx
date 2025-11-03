'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { World } from '@/types/world';
import { Skull } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

type TabProps = {
  world: World;
  activeRaceId: string;
};

export function GraveyardTab({ world, activeRaceId }: TabProps) {
    const deadCharacters = world.notableCharacters.filter(c => c.raceId === activeRaceId && c.status === 'dead');

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
        <ScrollArea className="h-[600px] pr-4">
            {deadCharacters.length > 0 ? (
                 <div className='grid md:grid-cols-2 gap-4'>
                    {deadCharacters.map(character => (
                        <Card key={character.id} className="bg-muted/30">
                            <CardHeader>
                                <CardTitle className='text-xl font-headline'>{character.name}</CardTitle>
                                <CardDescription>Died in Year {character.deathYear}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm italic text-muted-foreground'>"{character.deathNarrative || 'No final words were recorded.'}"</p>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className='flex flex-col items-center justify-center text-center py-16 text-muted-foreground'>
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
